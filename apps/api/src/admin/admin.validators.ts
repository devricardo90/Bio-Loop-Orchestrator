import {
  BUYER_APPROVAL_DECISIONS,
  BUYER_APPROVAL_REASONS,
  BUYER_APPROVAL_STATUSES,
  DISPUTE_RESOLUTION_DECISIONS,
  DISPUTE_REASONS,
  DISPUTE_STATUSES,
  type ApproveBuyerAdminInput,
  type ListBuyersQuery,
  type ListDisputesQuery,
  type ResolveDisputeAdminInput
} from "./admin.types";
import { unprocessableError } from "../trades/trade.errors";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toStringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function ensureString(value: unknown, code: string, message: string, field: string): string {
  const normalized = toStringValue(value);
  if (!normalized) {
    unprocessableError(code, message, { issues: [{ path: field, message: "Required" }] });
  }

  return normalized;
}

function ensureEnum<T extends readonly string[]>(
  value: unknown,
  allowed: T,
  code: string,
  message: string,
  field: string
): T[number] {
  const normalized = ensureString(value, code, message, field);
  if (!allowed.includes(normalized)) {
    unprocessableError(code, message, {
      issues: [{ path: field, message: `Must be one of: ${allowed.join(", ")}` }]
    });
  }

  return normalized as T[number];
}

function toOptionalString(value: unknown) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized || undefined;
}

function toOptionalPositiveInteger(value: unknown, code: string, message: string, field: string) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    unprocessableError(code, message, {
      issues: [{ path: field, message: "Must be a non-negative integer" }]
    });
  }

  return parsed;
}

export function normalizeApproveBuyerInput(input: unknown): ApproveBuyerAdminInput {
  if (!isRecord(input)) {
    unprocessableError("INVALID_APPROVE_BUYER_REQUEST", "Invalid buyer approval request", {
      issues: [{ path: "", message: "Request body must be an object" }]
    });
  }

  const result: ApproveBuyerAdminInput = {
    decision: ensureEnum(
      input["decision"],
      BUYER_APPROVAL_DECISIONS,
      "INVALID_APPROVE_BUYER_REQUEST",
      "Invalid buyer approval request",
      "decision"
    ),
    reason: ensureEnum(
      input["reason"],
      BUYER_APPROVAL_REASONS,
      "INVALID_APPROVE_BUYER_REQUEST",
      "Invalid buyer approval request",
      "reason"
    ),
    reviewerId: ensureString(
      input["reviewerId"],
      "INVALID_APPROVE_BUYER_REQUEST",
      "Invalid buyer approval request",
      "reviewerId"
    )
  };

  const notes = typeof input["notes"] === "string" && input["notes"].trim() ? input["notes"].trim() : null;
  if (notes) {
    result.notes = notes;
  }

  return result;
}

export function normalizeResolveDisputeInput(input: unknown): ResolveDisputeAdminInput {
  if (!isRecord(input)) {
    unprocessableError("INVALID_RESOLVE_DISPUTE_REQUEST", "Invalid dispute resolution request", {
      issues: [{ path: "", message: "Request body must be an object" }]
    });
  }

  const decision = ensureEnum(
    input["decision"],
    DISPUTE_RESOLUTION_DECISIONS,
    "INVALID_RESOLVE_DISPUTE_REQUEST",
    "Invalid dispute resolution request",
    "decision"
  );

  const result: ResolveDisputeAdminInput = {
    decision,
    reviewerId: ensureString(
      input["reviewerId"],
      "INVALID_RESOLVE_DISPUTE_REQUEST",
      "Invalid dispute resolution request",
      "reviewerId"
    )
  };

  const note = typeof input["note"] === "string" && input["note"].trim() ? input["note"].trim() : null;
  if (note) {
    result.note = note;
  }

  return result;
}

export function normalizeListDisputesQuery(input: unknown): ListDisputesQuery {
  if (!isRecord(input)) {
    return {};
  }

  const status = toOptionalString(input["status"]);
  const reason = toOptionalString(input["reason"]);
  const limit = toOptionalPositiveInteger(
    input["limit"],
    "INVALID_DISPUTE_LIST_QUERY",
    "Invalid dispute list query",
    "limit"
  );
  const offset = toOptionalPositiveInteger(
    input["offset"],
    "INVALID_DISPUTE_LIST_QUERY",
    "Invalid dispute list query",
    "offset"
  );

  return {
    ...(status
      ? {
          status: ensureEnum(
            status,
            DISPUTE_STATUSES,
            "INVALID_DISPUTE_LIST_QUERY",
            "Invalid dispute list query",
            "status"
          )
        }
      : {}),
    ...(reason
      ? {
          reason: ensureEnum(
            reason,
            DISPUTE_REASONS,
            "INVALID_DISPUTE_LIST_QUERY",
            "Invalid dispute list query",
            "reason"
          )
        }
      : {}),
    ...(limit !== undefined ? { limit } : {}),
    ...(offset !== undefined ? { offset } : {})
  };
}

export function normalizeListBuyersQuery(input: unknown): ListBuyersQuery {
  if (!isRecord(input)) {
    return {};
  }

  const status = toOptionalString(input["status"]);
  const search = toOptionalString(input["search"]);
  const limit = toOptionalPositiveInteger(
    input["limit"],
    "INVALID_BUYER_LIST_QUERY",
    "Invalid buyer list query",
    "limit"
  );
  const offset = toOptionalPositiveInteger(
    input["offset"],
    "INVALID_BUYER_LIST_QUERY",
    "Invalid buyer list query",
    "offset"
  );

  return {
    ...(status
      ? {
          status: ensureEnum(
            status,
            BUYER_APPROVAL_STATUSES,
            "INVALID_BUYER_LIST_QUERY",
            "Invalid buyer list query",
            "status"
          )
        }
      : {}),
    ...(search ? { search } : {}),
    ...(limit !== undefined ? { limit } : {}),
    ...(offset !== undefined ? { offset } : {})
  };
}
