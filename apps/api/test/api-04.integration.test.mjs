import assert from "node:assert/strict";
import { Prisma } from "@prisma/client";
import { OrdersController } from "../dist/trades/orders.controller.js";
import { TradesService } from "../dist/trades/trades.service.js";

function createFakePrisma() {
  const state = {
    stores: new Map(),
    categories: new Map(),
    buyers: new Map(),
    lots: new Map(),
    auctions: new Map(),
    bids: new Map(),
    orders: new Map(),
    pickupProofs: new Map(),
    disputes: new Map()
  };

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const toDate = (value) => (value instanceof Date ? value : new Date(value));
  const toDecimal = (value) => Number(value);

  const prisma = {
    $transaction: async (fn) => fn(prisma),
    store: {
      create: async ({ data }) => {
        const record = { id: data.id ?? `store_${state.stores.size + 1}`, ...data };
        state.stores.set(record.id, clone(record));
        return clone(record);
      }
    },
    commodityCategory: {
      create: async ({ data }) => {
        const record = { id: data.id ?? `category_${state.categories.size + 1}`, ...data };
        state.categories.set(record.id, clone(record));
        return clone(record);
      }
    },
    buyer: {
      create: async ({ data }) => {
        const record = { id: data.id ?? `buyer_${state.buyers.size + 1}`, ...data };
        state.buyers.set(record.id, clone(record));
        return clone(record);
      },
      findUnique: async ({ where }) => clone(state.buyers.get(where.id) ?? null)
    },
    lot: {
      create: async ({ data }) => {
        const record = {
          id: data.id ?? `lot_${state.lots.size + 1}`,
          status: "DRAFT",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          auctions: [],
          order: null,
          ...data
        };
        state.lots.set(record.id, clone(record));
        return clone(record);
      },
      findUnique: async ({ where, include }) => {
        const lot = state.lots.get(where.id);
        if (!lot) {
          return null;
        }

        if (include?.auctions) {
          const auctions = [...state.auctions.values()].filter((auction) => auction.lotId === lot.id);
          return clone({ ...lot, auctions });
        }

        return clone(lot);
      },
      update: async ({ where, data }) => {
        const lot = state.lots.get(where.id);
        if (!lot) {
          throw new Error("lot not found");
        }

        const updated = { ...lot, ...data, updatedAt: new Date().toISOString() };
        state.lots.set(where.id, clone(updated));
        return clone(updated);
      }
    },
    auction: {
      create: async ({ data }) => {
        const record = {
          id: data.id ?? `auction_${state.auctions.size + 1}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          highestBidId: null,
          ...data,
          startAt: toDate(data.startAt),
          endAt: toDate(data.endAt)
        };
        state.auctions.set(record.id, clone(record));
        return clone(record);
      },
      findUnique: async ({ where, include }) => {
        const auction = state.auctions.get(where.id);
        if (!auction) {
          return null;
        }

        if (include?.lot || include?.highestBid) {
          const highestBid = auction.highestBidId ? state.bids.get(auction.highestBidId) ?? null : null;
          const lot = state.lots.get(auction.lotId) ?? null;
          return clone({
            ...auction,
            lot: include?.lot ? lot : undefined,
            highestBid: include?.highestBid ? highestBid : undefined
          });
        }

        return clone(auction);
      },
      update: async ({ where, data }) => {
        const auction = state.auctions.get(where.id);
        if (!auction) {
          throw new Error("auction not found");
        }

        const updated = { ...auction, ...data, updatedAt: new Date().toISOString() };
        state.auctions.set(where.id, clone(updated));
        return clone(updated);
      }
    },
    bid: {
      create: async ({ data }) => {
        const record = {
          id: data.id ?? `bid_${state.bids.size + 1}`,
          createdAt: new Date().toISOString(),
          auctionId: data.auctionId,
          buyerId: data.buyerId,
          priceSekPerKg: toDecimal(data.priceSekPerKg)
        };
        state.bids.set(record.id, clone(record));
        return clone(record);
      }
    },
    order: {
      create: async ({ data }) => {
        const record = {
          id: data.id ?? `order_${state.orders.size + 1}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          pickupStatus: "PENDING",
          status: "CREATED",
          pickupWindowStartAt: null,
          pickupWindowEndAt: null,
          pickupScheduledAt: null,
          pickupCompletedAt: null,
          ...data,
          finalPriceSekPerKg: toDecimal(data.finalPriceSekPerKg)
        };
        state.orders.set(record.id, clone(record));
        return clone(record);
      },
      findUnique: async ({ where, include }) => {
        const order = state.orders.get(where.id);
        if (!order) {
          return null;
        }

        if (include?.dispute) {
          const dispute = [...state.disputes.values()].find((entry) => entry.orderId === order.id) ?? null;
          return clone({ ...order, dispute });
        }

        return clone(order);
      },
      update: async ({ where, data }) => {
        const order = state.orders.get(where.id);
        if (!order) {
          throw new Error("order not found");
        }

        const updated = { ...order, ...data, updatedAt: new Date().toISOString() };
        state.orders.set(where.id, clone(updated));
        return clone(updated);
      }
    },
    pickupProof: {
      create: async ({ data }) => {
        const record = {
          id: `proof_${state.pickupProofs.size + 1}`,
          createdAt: new Date().toISOString(),
          orderId: data.orderId,
          type: data.type,
          url: data.url
        };
        state.pickupProofs.set(record.id, clone(record));
        return clone(record);
      }
    },
    dispute: {
      create: async ({ data }) => {
        const record = {
          id: `dispute_${state.disputes.size + 1}`,
          orderId: data.orderId,
          status: data.status ?? "OPEN",
          reason: data.reason ?? "NO_SHOW",
          openedAt: new Date().toISOString(),
          resolvedAt: null,
          openedByUserId: null,
          resolvedByUserId: null
        };
        state.disputes.set(record.id, clone(record));
        return clone(record);
      },
      update: async ({ where, data }) => {
        const dispute = [...state.disputes.values()].find((entry) => entry.orderId === where.orderId);
        if (!dispute) {
          throw new Error("dispute not found");
        }

        const updated = { ...dispute, ...data };
        state.disputes.set(dispute.id, clone(updated));
        return clone(updated);
      }
    },
    __state: state
  };

  return prisma;
}

async function main() {
  const prisma = createFakePrisma();
  const service = new TradesService(prisma);
  const controller = new OrdersController(service);

  const store = await prisma.store.create({
    data: {
      name: "Central Store",
      address: "Main Street 1",
      timezone: "Europe/Stockholm",
      contacts: [],
      pickupWindows: []
    }
  });

  const category = await prisma.commodityCategory.create({
    data: {
      name: "Bakery surplus",
      storageCondition: "DRY",
      rulesDefault: []
    }
  });

  const buyer = await prisma.buyer.create({
    data: {
      name: "Nordic Feed AB",
      approved: true,
      radiusKmDefault: 100,
      reputation: 90
    }
  });

  const lot = await prisma.lot.create({
    data: {
      storeId: store.id,
      categoryId: category.id,
      storageCondition: "DRY",
      pickupWindowStartAt: new Date("2026-03-25T10:00:00.000Z"),
      pickupWindowEndAt: new Date("2026-03-25T12:00:00.000Z"),
      estimatedWeightKg: 100,
      finalWeightKg: null,
      grade: "A",
      status: "DRAFT"
    }
  });

  const auction = await service.startAuction({
    lotId: lot.id,
    reservePriceSekPerKg: 12,
    startAt: "2026-03-24T08:00:00.000Z",
    endAt: "2026-03-24T09:00:00.000Z"
  });

  const bidResult = await service.placeBid({
    auctionId: auction.id,
    buyerId: buyer.id,
    priceSekPerKg: 15
  });

  assert.equal(bidResult.auctionId, auction.id);
  assert.equal(bidResult.buyerId, buyer.id);

  const endResult = await service.endAuction(auction.id);
  const orderId = endResult.order.id;

  const scheduledResult = await controller.schedulePickup(orderId, {
    pickupWindow: {
      startAt: "2026-03-25T10:00:00.000Z",
      endAt: "2026-03-25T12:00:00.000Z"
    }
  });

  assert.equal(scheduledResult.order.id, orderId);
  assert.equal(scheduledResult.order.status, "CONFIRMED");
  assert.equal(scheduledResult.order.pickupStatus, "SCHEDULED");
  assert.deepEqual(scheduledResult.order.pickupWindow, {
    startAt: "2026-03-25T10:00:00.000Z",
    endAt: "2026-03-25T12:00:00.000Z"
  });

  const podResult = await controller.recordPod(orderId, {
    type: "PHOTO",
    url: "https://example.com/pod.jpg"
  });

  assert.equal(podResult.order.status, "SETTLED");
  assert.equal(podResult.order.pickupStatus, "COMPLETED");
  assert.equal(podResult.proof?.type, "PHOTO");
  assert.equal(podResult.proof?.url, "https://example.com/pod.jpg");

  const noShowOrder = await prisma.order.create({
    data: {
      lotId: lot.id,
      buyerId: buyer.id,
      finalPriceSekPerKg: new Prisma.Decimal(15),
      status: "CONFIRMED",
      pickupStatus: "SCHEDULED",
      pickupWindowStartAt: new Date("2026-03-25T10:00:00.000Z"),
      pickupWindowEndAt: new Date("2026-03-25T12:00:00.000Z")
    }
  });

  const noShowResult = await service.markNoShow(noShowOrder.id);
  assert.equal(noShowResult.order.status, "IN_DISPUTE");
  assert.equal(noShowResult.order.pickupStatus, "NO_SHOW");
  assert.equal(noShowResult.dispute?.status, "OPEN");
  assert.equal(noShowResult.dispute?.reason, "NO_SHOW");
}

await main();
