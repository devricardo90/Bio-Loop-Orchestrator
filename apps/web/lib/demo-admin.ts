import type {
  BuyerApprovalDecision,
  BuyerApprovalReason,
  BuyerApprovalStatus,
  DisputeReason,
  DisputeStatus
} from "./admin-api";

export type AdminBuyerRecord = {
  id: string;
  buyerId: string;
  name: string;
  email: string;
  status: BuyerApprovalStatus;
  reputationScore: number;
  riskLabel: string;
  notes: string;
  approval: {
    decision: BuyerApprovalDecision;
    reason: BuyerApprovalReason;
    reviewerId: string;
    notes: string;
    reviewedAt: string;
  } | null;
  updatedAt: string;
};

export type AdminDisputeRecord = {
  id: string;
  orderId: string;
  reason: DisputeReason;
  status: DisputeStatus;
  openedAt: string;
  resolvedAt: string | null;
  note: string;
};

export type AdminDemoState = {
  buyers: AdminBuyerRecord[];
  disputes: AdminDisputeRecord[];
  lastSyncedAt: string;
};

export function createDemoAdminState(): AdminDemoState {
  const now = new Date().toISOString();

  return {
    buyers: [
      {
        id: "approval-grainworks",
        buyerId: "buyer-grainworks",
        name: "GrainWorks AB",
        email: "ops@grainworks.example",
        status: "APPROVED",
        reputationScore: 92,
        riskLabel: "Low risk",
        notes: "Approved buyer for live auction and pickup workflows.",
        approval: {
          decision: "APPROVE",
          reason: "MANUAL_REVIEW",
          reviewerId: "user_platform_admin",
          notes: "Approved buyer for live auction and pickup workflows.",
          reviewedAt: now
        },
        updatedAt: now
      },
      {
        id: "approval-freshmart",
        buyerId: "buyer-freshmart",
        name: "FreshMart Logistics",
        email: "ops@freshmart.example",
        status: "PENDING",
        reputationScore: 74,
        riskLabel: "Needs review",
        notes: "Pending manual review in the admin workspace.",
        approval: null,
        updatedAt: now
      },
      {
        id: "approval-harbor-food",
        buyerId: "buyer-harbor-food",
        name: "Harbor Food Systems",
        email: "compliance@harborfood.example",
        status: "SUSPENDED",
        reputationScore: 61,
        riskLabel: "Compliance hold",
        notes: "Suspended while payment reconciliation is pending.",
        approval: {
          decision: "SUSPEND",
          reason: "PAYMENT_RISK",
          reviewerId: "user_platform_admin",
          notes: "Suspended while payment reconciliation is pending.",
          reviewedAt: now
        },
        updatedAt: now
      }
    ],
    disputes: [
      {
        id: "dispute-roots-01",
        orderId: "order-roots-01",
        reason: "NO_SHOW",
        status: "OPEN",
        openedAt: now,
        resolvedAt: null,
        note: "Pickup window passed without POD."
      },
      {
        id: "dispute-beets-01",
        orderId: "order-beets-01",
        reason: "QUALITY_ISSUE",
        status: "RESOLVED",
        openedAt: now,
        resolvedAt: now,
        note: "Settled after quality review."
      }
    ],
    lastSyncedAt: now
  };
}

export function mapBuyerDecisionToStatus(decision: BuyerApprovalDecision): BuyerApprovalStatus {
  if (decision === "APPROVE" || decision === "REINSTATE") {
    return "APPROVED";
  }

  if (decision === "REJECT") {
    return "REJECTED";
  }

  return "SUSPENDED";
}

export function defaultBuyerReasonForDecision(decision: BuyerApprovalDecision): BuyerApprovalReason {
  if (decision === "APPROVE" || decision === "REINSTATE") {
    return "MANUAL_REVIEW";
  }

  if (decision === "REJECT") {
    return "COMPLIANCE";
  }

  return "PAYMENT_RISK";
}

export function mapDisputeDecisionToStatus(decision: "SETTLE" | "CANCEL_ORDER" | "ESCALATE"): DisputeStatus {
  return decision === "ESCALATE" ? "OPEN" : "RESOLVED";
}

export function demoDisputeStatusLabel(status: DisputeStatus) {
  if (status === "OPEN") {
    return "Open";
  }

  if (status === "RESOLVED") {
    return "Resolved";
  }

  return "Cancelled";
}
