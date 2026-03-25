import { createHash } from "node:crypto";
import { conflictError } from "../trades/trade.errors";
import type { MutationContext } from "./mutation-context";
import { toActorKey } from "./mutation-context";

type MutationTx = {
  mutationIdempotency?: {
    create: (args: any) => Promise<unknown>;
    findUnique: (args: any) => Promise<{ requestHash: string; response: unknown } | null>;
    update: (args: any) => Promise<unknown>;
  };
  auditLog?: {
    create: (args: any) => Promise<unknown>;
  };
};

function stableSerialize(value: unknown): string {
  if (value === null) {
    return "null";
  }

  if (typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableSerialize(entry)).join(",")}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, entry]) => entry !== undefined)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, entry]) => `${JSON.stringify(key)}:${stableSerialize(entry)}`);

  return `{${entries.join(",")}}`;
}

export function createMutationRequestHash(value: unknown) {
  return createHash("sha256").update(stableSerialize(value)).digest("hex");
}

export async function runIdempotentMutation<T>(args: {
  tx: MutationTx;
  scope: string;
  context?: MutationContext | null | undefined;
  request: unknown;
  execute: () => Promise<T>;
}): Promise<T> {
  const { tx, scope, context, request, execute } = args;

  if (!tx.mutationIdempotency) {
    return execute();
  }

  const actorKey = toActorKey(context);
  const requestHash = createMutationRequestHash(request);
  const key = context?.idempotencyKey?.trim() || requestHash;
  const uniqueWhere = {
    scope_actorKey_key: {
      scope,
      actorKey,
      key
    }
  };

  try {
    await tx.mutationIdempotency.create({
      data: {
        scope,
        actorKey,
        key,
        requestHash,
        response: { pending: true }
      }
    });
  } catch (error) {
    const existing = await tx.mutationIdempotency.findUnique({ where: uniqueWhere });
    if (!existing) {
      throw error;
    }

    if (existing.requestHash !== requestHash) {
      conflictError("IDEMPOTENCY_KEY_REUSED", "Idempotency key was already used for a different request", {
        scope,
        actorKey
      });
    }

    return existing.response as T;
  }

  const result = await execute();
  await tx.mutationIdempotency.update({
    where: uniqueWhere,
    data: {
      requestHash,
      response: result
    }
  });

  return result;
}

export async function writeAuditLog(
  tx: MutationTx,
  entry: {
    actorUserId: string | null;
    entityType: string;
    entityId: string;
    action: string;
    payload?: Record<string, unknown> | null;
  }
) {
  if (!tx.auditLog) {
    return;
  }

  await tx.auditLog.create({
    data: {
      actorUserId: entry.actorUserId,
      entityType: entry.entityType,
      entityId: entry.entityId,
      action: entry.action,
      payload: entry.payload ?? null
    }
  });
}
