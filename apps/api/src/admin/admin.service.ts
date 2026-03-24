import { Injectable } from "@nestjs/common";
import type {
  Dispute as PrismaDispute,
  Order as PrismaOrder
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { conflictError, notFoundError } from "../trades/trade.errors";
import type {
  ApproveBuyerAdminInput,
  ApproveBuyerAdminResult,
  BuyerApprovalDecision,
  BuyerApprovalReason,
  BuyerApprovalStatus,
  ListDisputesQuery,
  ListDisputesResult,
  DisputeReason,
  DisputeResolutionDecision,
  ResolveDisputeAdminInput,
  ResolveDisputeAdminResult
} from "./admin.types";

type AdminBuyerApprovalRecord = {
  id: string;
  buyerId: string;
  status: BuyerApprovalStatus;
  decision: BuyerApprovalDecision | null;
  reason: BuyerApprovalReason | null;
  reviewerId: string | null;
  reviewedAt: Date | string | null;
  notes: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type AdminDisputeResolutionRecord = {
  id: string;
  disputeId: string;
  decision: DisputeResolutionDecision;
  note: string | null;
  reviewerId: string | null;
  resolvedAt: Date | string;
};

type AdminTransactionClient = {
  buyer: {
    findUnique: (args: { where: { id: string }; include?: { approval?: boolean } }) => Promise<{ id: string; approved: boolean } | null>;
    update: (args: { where: { id: string }; data: { approved: boolean } }) => Promise<{ id: string; approved: boolean }>;
  };
  buyerApproval: {
    upsert: (args: {
      where: { buyerId: string };
      create: {
        buyerId: string;
        status: string;
        decision: string;
        reason: string;
        reviewerId: string;
        reviewedAt: Date;
        notes: string | null;
      };
      update: {
        status: string;
        decision: string;
        reason: string;
        reviewerId: string;
        reviewedAt: Date;
        notes: string | null;
      };
    }) => Promise<AdminBuyerApprovalRecord>;
  };
  dispute: {
    findUnique: (args: {
      where: { id: string };
      include?: { order?: boolean; resolution?: boolean };
    }) => Promise<(PrismaDispute & { order?: PrismaOrder | null; resolution?: AdminDisputeResolutionRecord | null }) | null>;
    findMany: (args: { where?: { status?: string }; orderBy: { openedAt: "desc" } }) => Promise<PrismaDispute[]>;
    update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<PrismaDispute>;
  };
  disputeResolution: {
    upsert: (args: {
      where: { disputeId: string };
      create: {
        disputeId: string;
        decision: string;
        note: string | null;
        reviewerId: string;
        resolvedAt: Date;
      };
      update: {
        decision: string;
        note: string | null;
        reviewerId: string;
        resolvedAt: Date;
      };
    }) => Promise<AdminDisputeResolutionRecord>;
  };
  order: {
    update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<PrismaOrder>;
  };
  auditLog?: {
    create: (args: {
      data: {
        actorUserId: string | null;
        entityType: string;
        entityId: string;
        action: string;
        payload?: Record<string, unknown> | null;
      };
    }) => Promise<unknown>;
  };
};

function toIso(value: Date | string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function buyerApprovalToDto(approval: AdminBuyerApprovalRecord) {
  return {
    id: approval.id,
    buyerId: approval.buyerId,
    status: approval.status,
    decision: approval.decision,
    reason: approval.reason,
    reviewerId: approval.reviewerId,
    reviewedAt: toIso(approval.reviewedAt),
    notes: approval.notes,
    createdAt: toIso(approval.createdAt) ?? new Date(0).toISOString(),
    updatedAt: toIso(approval.updatedAt) ?? new Date(0).toISOString()
  };
}

function disputeToDto(dispute: PrismaDispute) {
  return {
    id: dispute.id,
    orderId: dispute.orderId,
    reason: (dispute.reason ?? "NO_SHOW") as DisputeReason,
    status: dispute.status,
    openedAt: toIso(dispute.openedAt) ?? new Date(0).toISOString(),
    resolvedAt: toIso(dispute.resolvedAt)
  };
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async approveBuyer(buyerId: string, input: ApproveBuyerAdminInput): Promise<ApproveBuyerAdminResult> {
    return this.prisma.$transaction(async (tx) => {
      const adminTx = tx as unknown as AdminTransactionClient;

      const buyer = await adminTx.buyer.findUnique({
        where: { id: buyerId },
        include: { approval: true }
      });

      if (!buyer) {
        notFoundError("BUYER_NOT_FOUND", "Buyer not found", { buyerId });
      }

      const status = this.mapApprovalStatus(input.decision);
      const approved = status === "APPROVED";
      const now = new Date();

      const approval = await adminTx.buyerApproval.upsert({
        where: { buyerId },
        create: {
          buyerId,
          status,
          decision: input.decision,
          reason: input.reason,
          reviewerId: input.reviewerId,
          reviewedAt: now,
          notes: input.notes ?? null
        },
        update: {
          status,
          decision: input.decision,
          reason: input.reason,
          reviewerId: input.reviewerId,
          reviewedAt: now,
          notes: input.notes ?? null
        }
      });

      await adminTx.buyer.update({
        where: { id: buyerId },
        data: { approved }
      });

      await this.writeAuditLog(adminTx, {
        actorUserId: input.reviewerId,
        entityType: "Buyer",
        entityId: buyerId,
        action: "buyer_approval_decision",
        payload: {
          decision: input.decision,
          reason: input.reason,
          notes: input.notes ?? null,
          status
        }
      });

      return { approval: buyerApprovalToDto(approval) };
    });
  }

  async listDisputes(query: ListDisputesQuery): Promise<ListDisputesResult> {
    const disputeClient = this.prisma.dispute as unknown as {
      findMany: (args: { where?: { status?: string }; orderBy: { openedAt: "desc" } }) => Promise<PrismaDispute[]>;
    };
    const disputes = await disputeClient.findMany(
      query.status
        ? { where: { status: query.status }, orderBy: { openedAt: "desc" } }
        : { orderBy: { openedAt: "desc" } }
    );

    return {
      disputes: disputes.map((dispute) => disputeToDto(dispute))
    };
  }

  async resolveDispute(disputeId: string, input: ResolveDisputeAdminInput): Promise<ResolveDisputeAdminResult> {
    return this.prisma.$transaction(async (tx) => {
      const adminTx = tx as unknown as AdminTransactionClient;

      const dispute = await adminTx.dispute.findUnique({
        where: { id: disputeId },
        include: {
          order: true,
          resolution: true
        }
      });

      if (!dispute) {
        notFoundError("DISPUTE_NOT_FOUND", "Dispute not found", { disputeId });
      }

      if (dispute.status !== "OPEN") {
        conflictError("DISPUTE_NOT_OPEN", "Dispute can only be resolved while open", {
          disputeId,
          status: dispute.status
        });
      }

      const now = new Date();
      const resolution = await adminTx.disputeResolution.upsert({
        where: { disputeId },
        create: {
          disputeId: dispute.id,
          decision: input.decision,
          note: input.note ?? null,
          reviewerId: input.reviewerId,
          resolvedAt: now
        },
        update: {
          decision: input.decision,
          note: input.note ?? null,
          reviewerId: input.reviewerId,
          resolvedAt: now
        }
      });

      let updatedDispute = dispute;

      if (input.decision === "SETTLE" || input.decision === "CANCEL_ORDER") {
        const orderStatus = input.decision === "SETTLE" ? "SETTLED" : "CANCELLED";

        await adminTx.order.update({
          where: { id: dispute.orderId },
          data: { status: orderStatus }
        });

        updatedDispute = await adminTx.dispute.update({
          where: { id: dispute.id },
          data: {
            status: "RESOLVED",
            resolvedAt: now,
            resolvedByUserId: input.reviewerId
          }
        });
      }

      await this.writeAuditLog(adminTx, {
        actorUserId: input.reviewerId,
        entityType: "Dispute",
        entityId: disputeId,
        action: "dispute_resolution_decision",
        payload: {
          decision: input.decision,
          note: input.note ?? null,
          resolutionId: resolution.id
        }
      });

      return { dispute: disputeToDto(updatedDispute) };
    });
  }

  private mapApprovalStatus(decision: ApproveBuyerAdminInput["decision"]) {
    if (decision === "APPROVE" || decision === "REINSTATE") {
      return "APPROVED" as const;
    }

    if (decision === "REJECT") {
      return "REJECTED" as const;
    }

    return "SUSPENDED" as const;
  }

  private async writeAuditLog(
    tx: AdminTransactionClient,
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
}
