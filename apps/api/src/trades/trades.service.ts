import { Injectable } from "@nestjs/common";
import { Prisma, type Auction as PrismaAuction, type Bid as PrismaBid, type Order as PrismaOrder } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { conflictError, notFoundError, unprocessableError } from "./trade.errors";
import { normalizePlaceBidInput } from "./trades.validators";
import type { EndAuctionResult, PlaceBidInput, StartAuctionInput } from "./trades.types";

const ACTIVE_AUCTION_STATUSES = new Set(["SCHEDULED", "LIVE"]);

function toNumber(value: Prisma.Decimal | number | string | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  return Number(value);
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
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
  return {
    id: order.id,
    lotId: order.lotId,
    buyerId: order.buyerId,
    finalPriceSekPerKg: toNumber(order.finalPriceSekPerKg),
    status: order.status,
    pickupStatus: order.pickupStatus
  };
}

@Injectable()
export class TradesService {
  constructor(private readonly prisma: PrismaService) {}

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

  async placeBid(input: PlaceBidInput) {
    const parsed = normalizePlaceBidInput(input);

    return this.prisma.$transaction(async (tx) => {
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

      return bidToDto(bid);
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
}
