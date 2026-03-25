import { Injectable } from "@nestjs/common";
import {
  Prisma,
  type Auction as PrismaAuction,
  type Bid as PrismaBid,
  type Dispute as PrismaDispute,
  type Order as PrismaOrder,
  type PickupProof as PrismaPickupProof
} from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { conflictError, notFoundError, unprocessableError } from "./trade.errors";
import {
  normalizePlaceBidInput,
  normalizeRecordPickupInput,
  normalizeSchedulePickupInput
} from "./trades.validators";
import type { MutationContext } from "../mutations/mutation-context";
import { runIdempotentMutation, writeAuditLog } from "../mutations/mutation-guards";
import type {
  BuyerAuctionDetailResult,
  BuyerFeedResult,
  BuyerWorkspaceAuctionRecordDto,
  BuyerWorkspaceBuyerDto,
  DisputeDto,
  EndAuctionResult,
  PickupProofDto,
  PlaceBidInput,
  RecordPickupProofInput,
  RecordPickupProofResult,
  SchedulePickupInput,
  SchedulePickupResult,
  StartAuctionInput
} from "./trades.types";

const ACTIVE_AUCTION_STATUSES = new Set(["SCHEDULED", "LIVE"]);
const STOCKHOLM_REFERENCE = {
  latitude: 59.3293,
  longitude: 18.0686
} as const;

type BuyerWorkspaceBuyerRecord = {
  id: string;
  name: string;
  approved: boolean;
  reputation: number;
  city: string | null;
  metadata: Prisma.JsonValue | null;
};

const buyerWorkspaceBuyerSelect = Prisma.validator<Prisma.BuyerSelect>()({
  id: true,
  name: true,
  approved: true,
  reputation: true,
  city: true,
  metadata: true
});

const buyerWorkspaceAuctionSelect = Prisma.validator<Prisma.AuctionSelect>()({
  id: true,
  lotId: true,
  reservePriceSekPerKg: true,
  startAt: true,
  endAt: true,
  status: true,
  highestBidId: true,
  createdAt: true,
  updatedAt: true,
  bids: {
    orderBy: {
      createdAt: "asc"
    },
    select: {
      id: true,
      auctionId: true,
      buyerId: true,
      priceSekPerKg: true,
      createdAt: true
    }
  },
  highestBid: {
    select: {
      id: true,
      auctionId: true,
      buyerId: true,
      priceSekPerKg: true,
      createdAt: true
    }
  },
  lot: {
    select: {
      id: true,
      storeId: true,
      categoryId: true,
      storageCondition: true,
      pickupWindowStartAt: true,
      pickupWindowEndAt: true,
      estimatedWeightKg: true,
      finalWeightKg: true,
      grade: true,
      status: true,
      store: {
        select: {
          id: true,
          name: true,
          latitude: true,
          longitude: true
        }
      },
      category: {
        select: {
          id: true,
          name: true,
          rulesDefault: true
        }
      },
      order: {
        select: {
          id: true,
          lotId: true,
          buyerId: true,
          finalPriceSekPerKg: true,
          status: true,
          pickupStatus: true,
          createdAt: true,
          updatedAt: true,
          pickupWindowStartAt: true,
          pickupWindowEndAt: true,
          pickupScheduledAt: true,
          pickupCompletedAt: true,
          dispute: true,
          proofs: {
            orderBy: {
              createdAt: "desc"
            },
            select: {
              id: true,
              orderId: true,
              type: true,
              url: true,
              createdAt: true
            }
          }
        }
      }
    }
  }
});

type BuyerWorkspaceAuctionRecord = Prisma.AuctionGetPayload<{
  select: typeof buyerWorkspaceAuctionSelect;
}>;

function toNumber(value: Prisma.Decimal | number | string | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  return Number(value);
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function toDateValue(value: Date | string | null | undefined): Date | null {
  if (value === null || value === undefined) {
    return null;
  }

  return value instanceof Date ? value : new Date(value);
}

function bidToDto(bid: PrismaBid) {
  return {
    id: bid.id,
    auctionId: bid.auctionId,
    buyerId: bid.buyerId,
    priceSekPerKg: toNumber(bid.priceSekPerKg),
    createdAt: toIsoString(bid.createdAt)
  };
}

function auctionToDto(auction: PrismaAuction, highestBid: PrismaBid | null) {
  return {
    id: auction.id,
    lotId: auction.lotId,
    reservePriceSekPerKg: toNumber(auction.reservePriceSekPerKg),
    startAt: toIsoString(auction.startAt),
    endAt: toIsoString(auction.endAt),
    status: auction.status,
    highestBid: highestBid ? bidToDto(highestBid) : null
  };
}

function orderToDto(order: PrismaOrder) {
  const pickupWindowStartAt = toDateValue((order as PrismaOrder & { pickupWindowStartAt?: Date | string | null }).pickupWindowStartAt);
  const pickupWindowEndAt = toDateValue((order as PrismaOrder & { pickupWindowEndAt?: Date | string | null }).pickupWindowEndAt);

  return {
    id: order.id,
    lotId: order.lotId,
    buyerId: order.buyerId,
    finalPriceSekPerKg: toNumber(order.finalPriceSekPerKg),
    status: order.status,
    pickupStatus: order.pickupStatus,
    pickupWindow:
      pickupWindowStartAt && pickupWindowEndAt
        ? {
            startAt: toIsoString(pickupWindowStartAt),
            endAt: toIsoString(pickupWindowEndAt)
          }
        : null
  };
}

function pickupProofToDto(proof: PrismaPickupProof): PickupProofDto {
  return {
    id: proof.id,
    orderId: proof.orderId,
    type: proof.type,
    url: proof.url,
    createdAt: toIsoString(proof.createdAt)
  };
}

function disputeToDto(dispute: PrismaDispute): DisputeDto {
  return {
    id: dispute.id,
    orderId: dispute.orderId,
    reason: dispute.reason ?? "NO_SHOW",
    status: dispute.status,
    openedAt: toIsoString(dispute.openedAt),
    resolvedAt: dispute.resolvedAt ? toIsoString(dispute.resolvedAt) : null
  };
}

function getJsonStringField(value: Prisma.JsonValue | null | undefined, key: string): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  return typeof record[key] === "string" ? record[key] : null;
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function approximateDistanceKm(latitude: Prisma.Decimal | number | string | null, longitude: Prisma.Decimal | number | string | null) {
  const lat = toNumber(latitude);
  const lon = toNumber(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat === 0 || lon === 0) {
    return 0;
  }

  const earthRadiusKm = 6371;
  const dLat = toRadians(lat - STOCKHOLM_REFERENCE.latitude);
  const dLon = toRadians(lon - STOCKHOLM_REFERENCE.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(STOCKHOLM_REFERENCE.latitude)) *
      Math.cos(toRadians(lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Number((earthRadiusKm * c).toFixed(1));
}

function workspaceBuyerToDto(buyer: BuyerWorkspaceBuyerRecord): BuyerWorkspaceBuyerDto {
  return {
    id: buyer.id,
    name: buyer.name,
    approved: buyer.approved,
    reputation: buyer.reputation,
    note:
      getJsonStringField(buyer.metadata, "riskLabel") ??
      (buyer.approved ? "Approved for live bidding" : "Pending approval for live bidding")
  };
}

function workspaceOrderToDto(
  order: (PrismaOrder & { dispute: PrismaDispute | null; proofs: PrismaPickupProof[] }) | null | undefined
) {
  if (!order) {
    return undefined;
  }

  const latestProof = order.proofs[0] ?? null;
  const pickupWindowStartAt = toDateValue((order as PrismaOrder & { pickupWindowStartAt?: Date | string | null }).pickupWindowStartAt);
  const pickupWindowEndAt = toDateValue((order as PrismaOrder & { pickupWindowEndAt?: Date | string | null }).pickupWindowEndAt);
  const pickupScheduledAt = toDateValue((order as PrismaOrder & { pickupScheduledAt?: Date | string | null }).pickupScheduledAt);
  const pickupCompletedAt = toDateValue((order as PrismaOrder & { pickupCompletedAt?: Date | string | null }).pickupCompletedAt);

  return {
    ...orderToDto(order),
    pickupWindow:
      pickupWindowStartAt && pickupWindowEndAt
        ? {
            startAt: toIsoString(pickupWindowStartAt),
            endAt: toIsoString(pickupWindowEndAt)
          }
        : null,
    pickupScheduledAt: pickupScheduledAt ? toIsoString(pickupScheduledAt) : null,
    pickupCompletedAt: pickupCompletedAt ? toIsoString(pickupCompletedAt) : null,
    pickupProof: latestProof ? pickupProofToDto(latestProof) : null,
    dispute: order.dispute ? disputeToDto(order.dispute) : null
  };
}

function buildAuctionSummary(record: BuyerWorkspaceAuctionRecord) {
  const categorySummary = getJsonStringField(record.lot.category.rulesDefault, "notes");
  if (categorySummary) {
    return categorySummary;
  }

  if (record.status === "LIVE") {
    return "Live auction ready for bids from approved industrial buyers.";
  }

  if (record.status === "SCHEDULED") {
    return "Scheduled auction waiting for its runtime window.";
  }

  if (record.status === "VOID") {
    return "Void auction retained for edge-state validation.";
  }

  return "Awarded or completed scenario kept for downstream pickup and billing flows.";
}

function buildAuctionTags(record: BuyerWorkspaceAuctionRecord) {
  const tags = new Set<string>();
  tags.add(record.status);
  tags.add(record.lot.storageCondition);

  if (record.lot.order?.pickupStatus === "SCHEDULED") {
    tags.add("PICKUP SCHEDULED");
  }

  if (record.lot.order?.pickupStatus === "COMPLETED") {
    tags.add("COMPLETED");
  }

  if (record.lot.order?.pickupStatus === "NO_SHOW") {
    tags.add("NO_SHOW");
  }

  if (record.lot.status === "EXPIRED") {
    tags.add("EXPIRED");
  }

  if (record.lot.status === "AWARDED") {
    tags.add("AWARDED");
  }

  return [...tags];
}

function workspaceAuctionRecordToDto(record: BuyerWorkspaceAuctionRecord): BuyerWorkspaceAuctionRecordDto {
  const pickupWindowStartAt = toDateValue(record.lot.pickupWindowStartAt);
  const pickupWindowEndAt = toDateValue(record.lot.pickupWindowEndAt);
  const order = workspaceOrderToDto(record.lot.order);

  return {
    id: record.id,
    storeName: record.lot.store.name,
    categoryName: record.lot.category.name,
    distanceKm: approximateDistanceKm(record.lot.store.latitude, record.lot.store.longitude),
    summary: buildAuctionSummary(record),
    tags: buildAuctionTags(record),
    lot: {
      id: record.lot.id,
      storeId: record.lot.storeId,
      categoryId: record.lot.categoryId,
      storageCondition: record.lot.storageCondition,
      pickupWindow: {
        startAt: pickupWindowStartAt ? toIsoString(pickupWindowStartAt) : new Date(0).toISOString(),
        endAt: pickupWindowEndAt ? toIsoString(pickupWindowEndAt) : new Date(0).toISOString()
      },
      estimatedWeightKg: toNumber(record.lot.estimatedWeightKg),
      finalWeightKg: record.lot.finalWeightKg ? toNumber(record.lot.finalWeightKg) : null,
      grade: record.lot.grade,
      status: record.lot.status
    },
    auction: auctionToDto(record, record.highestBid),
    bids: record.bids.map((bid) => bidToDto(bid)),
    ...(order ? { order } : {})
  };
}

@Injectable()
export class TradesService {
  constructor(private readonly prisma: PrismaService) {}

  async listBuyerFeed(): Promise<BuyerFeedResult> {
    const [buyers, auctions] = await Promise.all([this.loadWorkspaceBuyers(), this.loadWorkspaceAuctions()]);
    const activeBuyerId = buyers.find((buyer) => buyer.approved)?.id ?? buyers[0]?.id ?? "";

    return {
      buyers,
      activeBuyerId,
      auctions,
      lastSyncedAt: new Date().toISOString(),
      source: "api"
    };
  }

  async getBuyerAuctionDetail(auctionId: string): Promise<BuyerAuctionDetailResult> {
    const [buyers, auctions] = await Promise.all([this.loadWorkspaceBuyers(), this.loadWorkspaceAuctions()]);
    const auction = auctions.find((entry) => entry.id === auctionId);

    if (!auction) {
      notFoundError("AUCTION_NOT_FOUND", "Auction not found", { auctionId });
    }

    const activeBuyerId = buyers.find((buyer) => buyer.approved)?.id ?? buyers[0]?.id ?? "";

    return {
      buyers,
      activeBuyerId,
      auction,
      relatedAuctions: auctions.filter((entry) => entry.id !== auctionId),
      lastSyncedAt: new Date().toISOString(),
      source: "api"
    };
  }

  async startAuction(input: StartAuctionInput) {
    return this.prisma.$transaction(async (tx) => {
      const lot = await tx.lot.findUnique({
        where: { id: input.lotId },
        include: { auctions: true }
      });

      if (!lot) {
        notFoundError("LOT_NOT_FOUND", "Lot not found", { lotId: input.lotId });
      }

      if (lot.status === "CANCELLED" || lot.status === "EXPIRED") {
        conflictError("LOT_NOT_LISTABLE", "Lot is not available for auction", { lotId: lot.id, lotStatus: lot.status });
      }

      const activeAuction = lot.auctions.find((auction) => ACTIVE_AUCTION_STATUSES.has(auction.status));
      if (activeAuction) {
        conflictError("LOT_ALREADY_HAS_ACTIVE_AUCTION", "Lot already has an active auction", { lotId: lot.id });
      }

      const auction = await tx.auction.create({
        data: {
          lotId: lot.id,
          reservePriceSekPerKg: new Prisma.Decimal(input.reservePriceSekPerKg),
          startAt: new Date(input.startAt),
          endAt: new Date(input.endAt),
          status: "SCHEDULED"
        }
      });

      const liveAuction = await tx.auction.update({
        where: { id: auction.id },
        data: { status: "LIVE" }
      });

      await tx.lot.update({
        where: { id: lot.id },
        data: { status: "LISTED" }
      });

      return auctionToDto(liveAuction, null);
    });
  }

  async placeBid(input: PlaceBidInput, context?: MutationContext | null) {
    const parsed = normalizePlaceBidInput(input);

    return this.prisma.$transaction(async (tx) => {
      return runIdempotentMutation({
        tx,
        scope: "buyer.auction.bid",
        context,
        request: parsed,
        execute: async () => {
          const auction = await tx.auction.findUnique({
            where: { id: parsed.auctionId },
            include: {
              lot: true,
              highestBid: true
            }
          });

          if (!auction) {
            notFoundError("AUCTION_NOT_FOUND", "Auction not found", { auctionId: parsed.auctionId });
          }

          if (auction.status !== "LIVE") {
            conflictError("AUCTION_NOT_LIVE", "Bid is only accepted while auction is LIVE", {
              auctionId: auction.id,
              status: auction.status
            });
          }

          const buyer = await tx.buyer.findUnique({
            where: { id: parsed.buyerId }
          });

          if (!buyer) {
            notFoundError("BUYER_NOT_FOUND", "Buyer not found", { buyerId: parsed.buyerId });
          }

          if (!buyer.approved) {
            conflictError("BUYER_NOT_APPROVED", "Buyer is not approved to bid", { buyerId: buyer.id });
          }

          const highestBidValue = auction.highestBid ? toNumber(auction.highestBid.priceSekPerKg) : 0;
          if (parsed.priceSekPerKg <= highestBidValue) {
            unprocessableError("BID_TOO_LOW", "Bid must be higher than current highest bid", {
              currentHighestBidSekPerKg: highestBidValue,
              priceSekPerKg: parsed.priceSekPerKg
            });
          }

          const bid = await tx.bid.create({
            data: {
              auctionId: auction.id,
              buyerId: buyer.id,
              priceSekPerKg: new Prisma.Decimal(parsed.priceSekPerKg)
            }
          });

          await tx.auction.update({
            where: { id: auction.id },
            data: { highestBidId: bid.id }
          });

          await writeAuditLog(tx, {
            actorUserId: context?.actor?.id ?? null,
            entityType: "Auction",
            entityId: auction.id,
            action: "bid_placed",
            payload: {
              bidId: bid.id,
              buyerId: buyer.id,
              priceSekPerKg: parsed.priceSekPerKg,
              requestId: context?.requestId ?? null,
              idempotencyKey: context?.idempotencyKey ?? null
            }
          });

          return bidToDto(bid);
        }
      });
    });
  }

  async endAuction(auctionId: string): Promise<EndAuctionResult> {
    return this.prisma.$transaction(async (tx) => {
      const auction = await tx.auction.findUnique({
        where: { id: auctionId },
        include: {
          lot: true,
          highestBid: true
        }
      });

      if (!auction) {
        notFoundError("AUCTION_NOT_FOUND", "Auction not found", { auctionId });
      }

      if (auction.status !== "LIVE") {
        conflictError("AUCTION_NOT_ENDABLE", "Auction can only be ended from LIVE state", {
          auctionId: auction.id,
          status: auction.status
        });
      }

      const highestBid = auction.highestBid;
      const reservePriceSekPerKg = toNumber(auction.reservePriceSekPerKg);
      const highestBidSekPerKg = highestBid ? toNumber(highestBid.priceSekPerKg) : 0;

      if (!highestBid || highestBidSekPerKg < reservePriceSekPerKg) {
        await tx.auction.update({
          where: { id: auction.id },
          data: { status: "VOID" }
        });

        await tx.lot.update({
          where: { id: auction.lotId },
          data: { status: "EXPIRED" }
        });

        return {
          auction: {
            id: auction.id,
            lotId: auction.lotId,
            status: "VOID"
          },
          order: null
        };
      }

      const order = await tx.order.create({
        data: {
          lotId: auction.lotId,
          buyerId: highestBid.buyerId,
          finalPriceSekPerKg: new Prisma.Decimal(highestBidSekPerKg),
          status: "CREATED",
          pickupStatus: "PENDING"
        }
      });

      await tx.auction.update({
        where: { id: auction.id },
        data: { status: "ENDED" }
      });

      await tx.lot.update({
        where: { id: auction.lotId },
        data: { status: "AWARDED" }
      });

      return {
        auction: {
          id: auction.id,
          lotId: auction.lotId,
          status: "ENDED"
        },
        order: orderToDto(order)
      };
    });
  }

  async schedulePickup(input: SchedulePickupInput, context?: MutationContext | null): Promise<SchedulePickupResult> {
    const parsed = normalizeSchedulePickupInput(input);
    const now = new Date();
    const pickupWindowStartAt = new Date(parsed.pickupWindow.startAt);
    const pickupWindowEndAt = new Date(parsed.pickupWindow.endAt);

    if (!Number.isFinite(pickupWindowStartAt.getTime()) || !Number.isFinite(pickupWindowEndAt.getTime())) {
      unprocessableError("INVALID_PICKUP_WINDOW", "pickupWindow.startAt and pickupWindow.endAt must be valid datetimes");
    }

    if (pickupWindowEndAt.getTime() <= pickupWindowStartAt.getTime()) {
      unprocessableError("INVALID_PICKUP_WINDOW", "pickupWindow.endAt must be after pickupWindow.startAt");
    }

    if (pickupWindowStartAt.getTime() <= now.getTime()) {
      unprocessableError("INVALID_PICKUP_WINDOW", "pickupWindow must be in the future");
    }

    return this.prisma.$transaction(async (tx) => {
      return runIdempotentMutation({
        tx,
        scope: "buyer.order.schedule_pickup",
        context,
        request: {
          orderId: parsed.orderId,
          pickupWindow: parsed.pickupWindow
        },
        execute: async () => {
          const order = await tx.order.findUnique({
            where: { id: parsed.orderId },
            include: {
              dispute: true
            }
          });

          if (!order) {
            notFoundError("ORDER_NOT_FOUND", "Order not found", { orderId: parsed.orderId });
          }

          if (order.status === "CANCELLED" || order.status === "SETTLED") {
            conflictError("ORDER_NOT_SCHEDULABLE", "Order cannot schedule pickup in its current state", {
              orderId: order.id,
              status: order.status
            });
          }

          if (order.status === "IN_DISPUTE") {
            conflictError("ORDER_IN_DISPUTE", "Order cannot schedule pickup while in dispute", {
              orderId: order.id
            });
          }

          const updatedOrder = await tx.order.update({
            where: { id: order.id },
            data: {
              pickupWindowStartAt,
              pickupWindowEndAt,
              pickupScheduledAt: now,
              status: "CONFIRMED",
              pickupStatus: "SCHEDULED"
            }
          });

          await writeAuditLog(tx, {
            actorUserId: context?.actor?.id ?? null,
            entityType: "Order",
            entityId: order.id,
            action: "pickup_scheduled",
            payload: {
              pickupWindow: parsed.pickupWindow,
              requestId: context?.requestId ?? null,
              idempotencyKey: context?.idempotencyKey ?? null
            }
          });

          return {
            order: orderToDto(updatedOrder)
          };
        }
      });
    });
  }

  async recordPickupProof(input: RecordPickupProofInput, context?: MutationContext | null): Promise<RecordPickupProofResult> {
    const parsed = normalizeRecordPickupInput(input);
    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      return runIdempotentMutation({
        tx,
        scope: "buyer.order.record_pod",
        context,
        request: parsed,
        execute: async () => {
          const order = await tx.order.findUnique({
            where: { id: parsed.orderId },
            include: {
              dispute: true
            }
          });

          if (!order) {
            notFoundError("ORDER_NOT_FOUND", "Order not found", { orderId: parsed.orderId });
          }

          if (order.status === "CANCELLED" || order.status === "SETTLED" || order.status === "IN_DISPUTE") {
            conflictError("ORDER_NOT_ACCEPTING_POD", "Order cannot receive POD in its current state", {
              orderId: order.id,
              status: order.status
            });
          }

          const pickupWindowStartAt = toDateValue(
            (order as PrismaOrder & { pickupWindowStartAt?: Date | string | null }).pickupWindowStartAt
          );
          const pickupWindowEndAt = toDateValue(
            (order as PrismaOrder & { pickupWindowEndAt?: Date | string | null }).pickupWindowEndAt
          );

          if (!pickupWindowStartAt || !pickupWindowEndAt) {
            conflictError("PICKUP_NOT_SCHEDULED", "Pickup must be scheduled before POD upload", { orderId: order.id });
          }

          if (now.getTime() > pickupWindowEndAt.getTime()) {
            return this.markNoShowWithinTransaction(tx, order.id, context);
          }

          const proof = await tx.pickupProof.create({
            data: {
              orderId: order.id,
              type: parsed.type,
              url: parsed.url
            }
          });

          const updatedOrder = await tx.order.update({
            where: { id: order.id },
            data: {
              pickupCompletedAt: now,
              status: "SETTLED",
              pickupStatus: "COMPLETED"
            }
          });

          await writeAuditLog(tx, {
            actorUserId: context?.actor?.id ?? null,
            entityType: "Order",
            entityId: order.id,
            action: "pickup_pod_recorded",
            payload: {
              proofId: proof.id,
              type: parsed.type,
              url: parsed.url,
              requestId: context?.requestId ?? null,
              idempotencyKey: context?.idempotencyKey ?? null
            }
          });

          return {
            order: orderToDto(updatedOrder),
            proof: pickupProofToDto(proof)
          };
        }
      });
    });
  }

  async markNoShow(orderId: string, context: MutationContext = { source: "job" }): Promise<RecordPickupProofResult> {
    return this.prisma.$transaction(async (tx) => this.markNoShowWithinTransaction(tx, orderId, context));
  }

  private async markNoShowWithinTransaction(
    tx: Prisma.TransactionClient,
    orderId: string,
    context?: MutationContext | null
  ): Promise<RecordPickupProofResult> {
    return runIdempotentMutation({
      tx,
      scope: "order.no_show",
      context,
      request: {
        orderId,
        source: context?.source ?? "job"
      },
      execute: async () => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: {
            dispute: true
          }
        });

        if (!order) {
          notFoundError("ORDER_NOT_FOUND", "Order not found", { orderId });
        }

        if (order.status === "IN_DISPUTE" && order.pickupStatus === "NO_SHOW" && order.dispute?.status === "OPEN") {
          return {
            order: orderToDto(order),
            ...(order.dispute ? { dispute: disputeToDto(order.dispute) } : {})
          };
        }

        const dispute = order.dispute
          ? await tx.dispute.update({
              where: { orderId: order.id },
              data: {
                status: "OPEN",
                reason: "NO_SHOW",
                resolvedAt: null
              }
            })
          : await tx.dispute.create({
              data: {
                orderId: order.id,
                status: "OPEN",
                reason: "NO_SHOW"
              }
            });

        const updatedOrder = await tx.order.update({
          where: { id: order.id },
          data: {
            status: "IN_DISPUTE",
            pickupStatus: "NO_SHOW"
          }
        });

        await writeAuditLog(tx, {
          actorUserId: context?.actor?.id ?? null,
          entityType: "Order",
          entityId: order.id,
          action: "order_marked_no_show",
          payload: {
            disputeId: dispute.id,
            source: context?.source ?? "job",
            requestId: context?.requestId ?? null,
            idempotencyKey: context?.idempotencyKey ?? null
          }
        });

        return {
          order: orderToDto(updatedOrder),
          dispute: disputeToDto(dispute)
        };
      }
    });
  }

  private async loadWorkspaceBuyers(): Promise<BuyerWorkspaceBuyerDto[]> {
    const buyers = await this.prisma.buyer.findMany({
      select: buyerWorkspaceBuyerSelect,
      orderBy: [{ approved: "desc" }, { reputation: "desc" }, { name: "asc" }]
    });

    return buyers.map((buyer) =>
      workspaceBuyerToDto({
        id: buyer.id,
        name: buyer.name,
        approved: buyer.approved,
        reputation: buyer.reputation,
        city: buyer.city,
        metadata: buyer.metadata
      })
    );
  }

  private async loadWorkspaceAuctions(): Promise<BuyerWorkspaceAuctionRecordDto[]> {
    const auctions = await this.prisma.auction.findMany({
      select: buyerWorkspaceAuctionSelect,
      orderBy: [{ endAt: "desc" }, { createdAt: "desc" }]
    });

    return auctions.map((auction) => workspaceAuctionRecordToDto(auction));
  }
}
