export const BUYER_APPROVAL_STATUSES = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"] as const;
export type BuyerApprovalStatus = (typeof BUYER_APPROVAL_STATUSES)[number];

export const BUYER_APPROVAL_DECISIONS = ["APPROVE", "REJECT", "SUSPEND", "REINSTATE"] as const;
export type BuyerApprovalDecision = (typeof BUYER_APPROVAL_DECISIONS)[number];

export const BUYER_APPROVAL_REASONS = [
  "AUTO_APPROVAL",
  "LOW_REPUTATION",
  "PAYMENT_RISK",
  "COMPLIANCE",
  "MANUAL_REVIEW"
] as const;
export type BuyerApprovalReason = (typeof BUYER_APPROVAL_REASONS)[number];

export const DISPUTE_STATUSES = ["OPEN", "RESOLVED", "CANCELLED"] as const;
export type DisputeStatus = (typeof DISPUTE_STATUSES)[number];

export const DISPUTE_REASONS = ["NO_SHOW", "QUALITY_ISSUE"] as const;
export type DisputeReason = (typeof DISPUTE_REASONS)[number];

export const DISPUTE_RESOLUTION_DECISIONS = ["SETTLE", "CANCEL_ORDER", "ESCALATE"] as const;
export type DisputeResolutionDecision = (typeof DISPUTE_RESOLUTION_DECISIONS)[number];

export interface BuyerApprovalDto {
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
}

export interface DisputeDto {
  id: string;
  orderId: string;
  reason: DisputeReason;
  status: DisputeStatus;
  openedAt: string;
  resolvedAt: string | null;
}

export interface BuyerRecordDto {
  id: string;
  buyerId: string;
  name: string;
  status: BuyerApprovalStatus;
  reputationScore: number;
  riskLabel: string;
  notes: string;
  approval: BuyerApprovalDto | null;
  updatedAt: string;
}

export interface ApproveBuyerAdminInput {
  decision: BuyerApprovalDecision;
  reason: BuyerApprovalReason;
  reviewerId: string;
  notes?: string;
}

export interface ResolveDisputeAdminInput {
  reviewerId: string;
  decision: DisputeResolutionDecision;
  note?: string;
}

export interface ListDisputesQuery {
  status?: DisputeStatus;
  reason?: DisputeReason;
  limit?: number;
  offset?: number;
}

export interface ListBuyersQuery {
  status?: BuyerApprovalStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ApproveBuyerAdminResult {
  approval: BuyerApprovalDto;
}

export interface ResolveDisputeAdminResult {
  dispute: DisputeDto;
}

export interface ListDisputesResult {
  disputes: DisputeDto[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

export interface ListBuyersResult {
  buyers: BuyerRecordDto[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}
