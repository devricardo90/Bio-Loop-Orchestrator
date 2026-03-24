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
        id: "buyer-registry-01",
        buyerId: "buyer-grainworks",
        name: "GrainWorks AB",
        email: "ops@grainworks.example",
        status: "APPROVED",
        reputationScore: 92,
        riskLabel: "Low risk",
        notes: "High volume buyer with stable settlements.",
        approval: {
          decision: "APPROVE",
          reason: "MANUAL_REVIEW",
          reviewerId: "admin-demo",
          notes: "Approved after manual review.",
          reviewedAt: now
        },
        updatedAt: now
      },
      {
        id: "buyer-registry-02",
        buyerId: "buyer-nova-brew",
        name: "Nova Brew Labs",
        email: "ops@novabrew.example",
        status: "PENDING",
        reputationScore: 44,
        riskLabel: "Needs review",
        notes: "Pending approval because of lower reputation score.",
        approval: null,
        updatedAt: now
      },
      {
        id: "buyer-registry-03",
        buyerId: "buyer-harbor-food",
        name: "Harbor Food Systems",
        email: "compliance@harborfood.example",
        status: "SUSPENDED",
        reputationScore: 61,
        riskLabel: "Compliance hold",
        notes: "Suspended while payment risk review is pending.",
        approval: {
          decision: "SUSPEND",
          reason: "PAYMENT_RISK",
          reviewerId: "admin-demo",
          notes: "Temporary hold until reconciliation.",
          reviewedAt: now
        },
        updatedAt: now
      }
    ],
    disputes: [
      {
        id: "dispute-101",
        orderId: "order-carrots-01",
        reason: "NO_SHOW",
        status: "OPEN",
        openedAt: now,
        resolvedAt: null,
        note: "Pickup window passed without POD."
      },
      {
        id: "dispute-102",
        orderId: "order-pomace-02",
        reason: "QUALITY_ISSUE",
        status: "OPEN",
        openedAt: now,
        resolvedAt: null,
        note: "Buyer reported moisture variance."
      },
      {
        id: "dispute-103",
        orderId: "order-husk-03",
        reason: "NO_SHOW",
        status: "RESOLVED",
        openedAt: now,
        resolvedAt: now,
        note: "Settled by admin review."
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
