import {
  BUYER_APPROVAL_DECISIONS,
  BUYER_APPROVAL_REASONS,
  DISPUTE_RESOLUTION_DECISIONS,
  DISPUTE_STATUSES,
  type ApproveBuyerAdminInput,
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
  if (!isRecord(input) || input["status"] === undefined || input["status"] === null || input["status"] === "") {
    return {};
  }

  return {
    status: ensureEnum(
      input["status"],
      DISPUTE_STATUSES,
      "INVALID_DISPUTE_LIST_QUERY",
      "Invalid dispute list query",
      "status"
    )
  };
}
