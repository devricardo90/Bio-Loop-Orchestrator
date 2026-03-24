const apiBaseUrl = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:4000";

export type BuyerApprovalDecision = "APPROVE" | "REJECT" | "SUSPEND" | "REINSTATE";
export type BuyerApprovalReason = "AUTO_APPROVAL" | "LOW_REPUTATION" | "PAYMENT_RISK" | "COMPLIANCE" | "MANUAL_REVIEW";
export type BuyerApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

export type DisputeStatus = "OPEN" | "RESOLVED" | "CANCELLED";
export type DisputeReason = "NO_SHOW" | "QUALITY_ISSUE";
export type DisputeResolutionDecision = "SETTLE" | "CANCEL_ORDER" | "ESCALATE";

export type BuyerApprovalDto = {
  id: string;
  buyerId: string;
  status: BuyerApprovalStatus;
  decision: BuyerApprovalDecision | null;
  reason: BuyerApprovalReason | null;
  reviewerId: string | null;
  reviewedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApproveBuyerResult = {
  approval: BuyerApprovalDto;
};

export type DisputeDto = {
  id: string;
  orderId: string;
  reason: DisputeReason;
  status: DisputeStatus;
  openedAt: string;
  resolvedAt: string | null;
};

export type ListDisputesResult = {
  disputes: DisputeDto[];
};

export type ResolveDisputeResult = {
  dispute: DisputeDto;
};

export async function approveBuyerOnApi(input: {
  buyerId: string;
  decision: BuyerApprovalDecision;
  reason: BuyerApprovalReason;
  reviewerId: string;
  notes?: string;
}): Promise<ApproveBuyerResult> {
  const csrfToken = await fetchAuthCsrfToken();
  const response = await fetch(`${apiBaseUrl}/admin/buyers/${input.buyerId}/approve`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken
    },
    body: JSON.stringify({
      decision: input.decision,
      reason: input.reason,
      reviewerId: input.reviewerId,
      notes: input.notes
    })
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(body || `Buyer approval request failed with ${response.status}`);
  }

  return (await response.json()) as ApproveBuyerResult;
}

export async function listAdminDisputes(status?: DisputeStatus): Promise<ListDisputesResult> {
  const url = new URL(`${apiBaseUrl}/admin/disputes`);
  if (status) {
    url.searchParams.set("status", status);
  }

  const response = await fetch(url, {
    method: "GET",
    credentials: "include"
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(body || `Disputes request failed with ${response.status}`);
  }

  return (await response.json()) as ListDisputesResult;
}

export async function resolveDisputeOnApi(input: {
  disputeId: string;
  decision: DisputeResolutionDecision;
  reviewerId: string;
  note?: string;
}): Promise<ResolveDisputeResult> {
  const csrfToken = await fetchAuthCsrfToken();
  const response = await fetch(`${apiBaseUrl}/admin/disputes/${input.disputeId}/resolve`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken
    },
    body: JSON.stringify({
      decision: input.decision,
      reviewerId: input.reviewerId,
      note: input.note
    })
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(body || `Dispute resolution request failed with ${response.status}`);
  }

  return (await response.json()) as ResolveDisputeResult;
}

async function fetchAuthCsrfToken() {
  const response = await fetch(`${apiBaseUrl}/auth/csrf`, {
    method: "GET",
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error(`CSRF request failed with ${response.status}`);
  }

  const payload = (await response.json()) as { csrfToken?: unknown };
  if (typeof payload.csrfToken !== "string" || payload.csrfToken.length === 0) {
    throw new Error("CSRF token missing from admin auth response");
  }

  return payload.csrfToken;
}
