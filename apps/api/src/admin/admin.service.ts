import { Injectable } from "@nestjs/common";
import type {
  Buyer as PrismaBuyer,
  BuyerApproval as PrismaBuyerApproval,
  Dispute as PrismaDispute,
  Order as PrismaOrder
} from "@prisma/client";
import { Prisma } from "@prisma/client";
import type { MutationContext } from "../mutations/mutation-context";
import { runIdempotentMutation, writeAuditLog } from "../mutations/mutation-guards";
import { PrismaService } from "../prisma/prisma.service";
import { conflictError, notFoundError } from "../trades/trade.errors";
import type {
  ApproveBuyerAdminInput,
  ApproveBuyerAdminResult,
  ListBuyersQuery,
  CatalogDescriptorDto,
  CatalogScope,
  BuyerApprovalDecision,
  BuyerApprovalReason,
  BuyerApprovalStatus,
  BuyerRecordDto,
  ListDisputesQuery,
  ListDisputesResult,
  ListBuyersResult,
  DisputeReason,
  DisputeResolutionDecision,
  ResolveDisputeAdminInput,
  ResolveDisputeAdminResult
} from "./admin.types";

const DEFAULT_PAGE_LIMIT = 25;
const MAX_PAGE_LIMIT = 100;

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

type AdminBuyerRecord = PrismaBuyer & {
  approval?: (PrismaBuyerApproval & {
    reviewer?: { id: string } | null;
  }) | null;
};

const adminBuyerListSelect = Prisma.validator<Prisma.BuyerSelect>()({
  id: true,
  name: true,
  approved: true,
  reputation: true,
  updatedAt: true,
  metadata: true,
  approval: true
});

type AdminBuyerListRecord = Prisma.BuyerGetPayload<{
  select: typeof adminBuyerListSelect;
}>;

type AdminDisputeResolutionRecord = {
  id: string;
  disputeId: string;
  decision: DisputeResolutionDecision;
  note: string | null;
  reviewerId: string | null;
  resolvedAt: Date | string;
};

const adminDisputeListInclude = Prisma.validator<Prisma.DisputeInclude>()({
  order: {
    include: {
      lot: {
        select: {
          metadata: true
        }
      }
    }
  }
});

type AdminDisputeListRecord = Prisma.DisputeGetPayload<{
  include: typeof adminDisputeListInclude;
}>;

type AdminTransactionClient = {
  buyer: {
    findUnique: (args: { where: { id: string }; include?: { approval?: boolean } }) => Promise<{ id: string; approved: boolean } | null>;
    update: (args: { where: { id: string }; data: { approved: boolean } }) => Promise<{ id: string; approved: boolean }>;
    findMany: (args: {
      where?: Record<string, unknown>;
      skip?: number;
      take?: number;
      orderBy: { updatedAt: "desc" };
      select?: typeof adminBuyerListSelect;
      include?: { approval: true };
    }) => Promise<AdminBuyerRecord[]>;
    count?: (args: { where?: Record<string, unknown> }) => Promise<number>;
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
    findMany: (args: {
      where?: Record<string, unknown>;
      orderBy: { openedAt: "desc" };
      skip?: number;
      take?: number;
      include?: typeof adminDisputeListInclude;
    }) => Promise<AdminDisputeListRecord[]>;
    count?: (args: { where?: Record<string, unknown> }) => Promise<number>;
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
  mutationIdempotency?: {
    create: (args: {
      data: {
        scope: string;
        actorKey: string;
        key: string;
        requestHash: string;
        response: Record<string, unknown>;
      };
    }) => Promise<unknown>;
    findUnique: (args: {
      where: {
        scope_actorKey_key: {
          scope: string;
          actorKey: string;
          key: string;
        };
      };
    }) => Promise<{ requestHash: string; response: unknown } | null>;
    update: (args: {
      where: {
        scope_actorKey_key: {
          scope: string;
          actorKey: string;
          key: string;
        };
      };
      data: { requestHash: string; response: unknown };
    }) => Promise<unknown>;
  };
};

function toIso(value: Date | string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function getJsonStringField(value: Prisma.JsonValue | null | undefined, key: string): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  return typeof record[key] === "string" ? record[key] : null;
}

function catalogDescriptorFromMetadata(metadata: Prisma.JsonValue | null | undefined): CatalogDescriptorDto {
  const source = getJsonStringField(metadata, "source");
  const dataset = getJsonStringField(metadata, "dataset");

  if (dataset === "sweden-supermarkets" || source === "sweden_real_import") {
    return {
      scope: "real",
      dataset: dataset ?? "sweden-supermarkets",
      source: source ?? "sweden_real_import",
      visibleByDefault: false
    };
  }

  return {
    scope: "demo",
    dataset: dataset ?? "scenario-seed",
    source: source ?? "scenario_seed",
    visibleByDefault: true
  };
}

function buildCatalogWhere(scope: CatalogScope, metadataField = "metadata"): Record<string, unknown> | undefined {
  if (scope === "all") {
    return undefined;
  }

  const metadataSelector = (path: string[], equals: string) => ({
    [metadataField]: {
      path,
      equals
    }
  });

  if (scope === "real") {
    return {
      OR: [metadataSelector(["dataset"], "sweden-supermarkets"), metadataSelector(["source"], "sweden_real_import")]
    };
  }

  return {
    OR: [metadataSelector(["source"], "scenario_seed"), metadataSelector(["dataset"], "scenario-seed")]
  };
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

function disputeToDto(
  dispute: PrismaDispute | (PrismaDispute & { order?: { lot?: { metadata?: Prisma.JsonValue | null } | null } | null })
) {
  const orderMetadata =
    "order" in dispute && dispute.order && typeof dispute.order === "object" ? dispute.order.lot?.metadata : null;

  return {
    id: dispute.id,
    orderId: dispute.orderId,
    reason: (dispute.reason ?? "NO_SHOW") as DisputeReason,
    status: dispute.status,
    openedAt: toIso(dispute.openedAt) ?? new Date(0).toISOString(),
    resolvedAt: toIso(dispute.resolvedAt),
    catalog: catalogDescriptorFromMetadata(orderMetadata)
  };
}

function buyerApprovalToBuyerDto(buyer: AdminBuyerListRecord): BuyerRecordDto {
  const approval = buyer.approval ?? null;
  const mappedApproval = approval
    ? {
        id: approval.id,
        buyerId: approval.buyerId,
        status: approval.status,
        decision: approval.decision ?? null,
        reason: approval.reason ?? null,
        reviewerId: approval.reviewerId ?? null,
        reviewedAt: toIso(approval.reviewedAt),
        notes: approval.notes ?? null,
        createdAt: toIso(approval.createdAt) ?? new Date(0).toISOString(),
        updatedAt: toIso(approval.updatedAt) ?? new Date(0).toISOString()
      }
    : null;

  return {
    id: buyer.id,
    buyerId: buyer.id,
    name: buyer.name,
    status: approval?.status ?? (buyer.approved ? "APPROVED" : "PENDING"),
    reputationScore: buyer.reputation,
    riskLabel: thisBuyerRiskLabel(buyer, approval),
    notes: thisBuyerNotes(buyer, approval),
    approval: mappedApproval,
    updatedAt: toIso(buyer.updatedAt) ?? new Date(0).toISOString(),
    catalog: catalogDescriptorFromMetadata(buyer.metadata)
  };
}

function thisBuyerRiskLabel(buyer: Pick<PrismaBuyer, "approved" | "reputation">, approval: PrismaBuyerApproval | null) {
  if (approval?.status === "APPROVED" || buyer.approved) {
    return buyer.reputation >= 80 ? "Low risk" : "Approved";
  }

  if (approval?.status === "REJECTED") {
    return "Compliance hold";
  }

  if (approval?.status === "SUSPENDED") {
    return "Payment risk";
  }

  if (buyer.reputation >= 70) {
    return "Needs review";
  }

  return "High risk";
}

function thisBuyerNotes(buyer: Pick<PrismaBuyer, "reputation" | "approved">, approval: PrismaBuyerApproval | null) {
  if (approval?.notes) {
    return approval.notes;
  }

  if (approval?.status === "APPROVED" || buyer.approved) {
    return "Buyer is approved and available for trade.";
  }

  if (approval?.status === "REJECTED") {
    return "Buyer was rejected during manual review.";
  }

  if (approval?.status === "SUSPENDED") {
    return "Buyer is suspended pending compliance review.";
  }

  if (buyer.reputation >= 70) {
    return "Buyer requires manual review before trading.";
  }

  return "Buyer is waiting for the initial approval decision.";
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listBuyers(query: ListBuyersQuery = {}): Promise<ListBuyersResult> {
    const pagination = this.normalizePagination(query.limit, query.offset);
    const filters: Record<string, unknown>[] = [];
    const catalogWhere = buildCatalogWhere(query.catalogScope ?? "demo");
    if (catalogWhere) {
      filters.push(catalogWhere);
    }
    if (query.search) {
      filters.push({
        OR: [{ id: { contains: query.search } }, { name: { contains: query.search, mode: "insensitive" } }]
      });
    }

    const statusWhere = this.buildBuyerStatusWhere(query.status);
    if (statusWhere) {
      filters.push(statusWhere);
    }
    const where = filters.length === 0 ? undefined : filters.length === 1 ? filters[0] : { AND: filters };

    const buyers = (await this.prisma.buyer.findMany({
      ...(where ? { where: where as Prisma.BuyerWhereInput } : {}),
      select: adminBuyerListSelect,
      orderBy: { updatedAt: "desc" },
      skip: pagination.offset,
      take: pagination.limit
    })) as AdminBuyerListRecord[];
    const total =
      typeof this.prisma.buyer.count === "function"
        ? where
          ? await this.prisma.buyer.count({ where: where as Prisma.BuyerWhereInput })
          : await this.prisma.buyer.count()
        : buyers.length;

    return {
      buyers: buyers.map((buyer) => buyerApprovalToBuyerDto(buyer)),
      pagination: {
        ...pagination,
        total,
        hasMore: pagination.offset + buyers.length < total
      }
    };
  }

  async approveBuyer(
    buyerId: string,
    input: ApproveBuyerAdminInput,
    context?: MutationContext | null
  ): Promise<ApproveBuyerAdminResult> {
    return this.prisma.$transaction(async (tx) => {
      const adminTx = tx as unknown as AdminTransactionClient;
      return runIdempotentMutation({
        tx: adminTx,
        scope: "admin.buyer.approve",
        context,
        request: {
          buyerId,
          decision: input.decision,
          reason: input.reason,
          reviewerId: input.reviewerId,
          notes: input.notes ?? null
        },
        execute: async () => {
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

          await writeAuditLog(adminTx, {
            actorUserId: context?.actor?.id ?? input.reviewerId,
            entityType: "Buyer",
            entityId: buyerId,
            action: "buyer_approval_decision",
            payload: {
              decision: input.decision,
              reason: input.reason,
              notes: input.notes ?? null,
              reviewerId: input.reviewerId,
              requestId: context?.requestId ?? null,
              idempotencyKey: context?.idempotencyKey ?? null,
              status
            }
          });

          return { approval: buyerApprovalToDto(approval) };
        }
      });
    });
  }

  async listDisputes(query: ListDisputesQuery): Promise<ListDisputesResult> {
    const pagination = this.normalizePagination(query.limit, query.offset);
    const filters: Record<string, unknown>[] = [];
    if (query.status) {
      filters.push({ status: query.status });
    }
    if (query.reason) {
      filters.push({ reason: query.reason });
    }
    const catalogWhere = buildCatalogWhere(query.catalogScope ?? "demo");
    if (catalogWhere) {
      filters.push({
        order: {
          lot: catalogWhere
        }
      });
    }
    const where = filters.length === 0 ? undefined : filters.length === 1 ? filters[0] : { AND: filters };

    const disputeClient = this.prisma.dispute as unknown as {
      findMany: (args: {
        where?: Record<string, unknown>;
        orderBy: { openedAt: "desc" };
        skip?: number;
        take?: number;
        include?: typeof adminDisputeListInclude;
      }) => Promise<AdminDisputeListRecord[]>;
      count?: (args: { where?: Record<string, unknown> }) => Promise<number>;
    };
    const disputes = await disputeClient.findMany({
      ...(where ? { where } : {}),
      include: adminDisputeListInclude,
      orderBy: { openedAt: "desc" },
      skip: pagination.offset,
      take: pagination.limit
    });
    const total =
      typeof disputeClient.count === "function"
        ? await disputeClient.count(where ? { where } : {})
        : disputes.length;

    return {
      disputes: disputes.map((dispute) => disputeToDto(dispute)),
      pagination: {
        ...pagination,
        total,
        hasMore: pagination.offset + disputes.length < total
      }
    };
  }

  async resolveDispute(
    disputeId: string,
    input: ResolveDisputeAdminInput,
    context?: MutationContext | null
  ): Promise<ResolveDisputeAdminResult> {
    return this.prisma.$transaction(async (tx) => {
      const adminTx = tx as unknown as AdminTransactionClient;
      return runIdempotentMutation({
        tx: adminTx,
        scope: "admin.dispute.resolve",
        context,
        request: {
          disputeId,
          decision: input.decision,
          reviewerId: input.reviewerId,
          note: input.note ?? null
        },
        execute: async () => {
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

          await writeAuditLog(adminTx, {
            actorUserId: context?.actor?.id ?? input.reviewerId,
            entityType: "Dispute",
            entityId: disputeId,
            action: "dispute_resolution_decision",
            payload: {
              decision: input.decision,
              note: input.note ?? null,
              reviewerId: input.reviewerId,
              requestId: context?.requestId ?? null,
              idempotencyKey: context?.idempotencyKey ?? null,
              resolutionId: resolution.id
            }
          });

          return { dispute: disputeToDto(updatedDispute) };
        }
      });
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

  private normalizePagination(limit?: number, offset?: number) {
    const safeLimit = Math.min(Math.max(limit ?? DEFAULT_PAGE_LIMIT, 1), MAX_PAGE_LIMIT);
    const safeOffset = Math.max(offset ?? 0, 0);

    return {
      limit: safeLimit,
      offset: safeOffset
    };
  }

  private buildBuyerStatusWhere(status?: BuyerApprovalStatus) {
    if (!status) {
      return null;
    }

    if (status === "PENDING") {
      return {
        approved: false,
        OR: [{ approval: { is: null } }, { approval: { is: { status: "PENDING" } } }]
      };
    }

    return {
      approval: {
        is: {
          status
        }
      }
    };
  }

}
