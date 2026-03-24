import assert from "node:assert/strict";
import { ApiJobsService } from "../dist/jobs/api-jobs.service.js";
import { TradesService } from "../dist/trades/trades.service.js";

function createFakePrisma() {
  const state = {
    lots: new Map(),
    auctions: new Map(),
    orders: new Map(),
    disputes: new Map()
  };

  const clone = (value) => JSON.parse(JSON.stringify(value));

  const prisma = {
    $transaction: async (fn) => fn(prisma),
    lot: {
      create: async ({ data }) => {
        const record = {
          id: data.id ?? `lot_${state.lots.size + 1}`,
          status: "DRAFT",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...data
        };
        state.lots.set(record.id, clone(record));
        return clone(record);
      },
      findUnique: async ({ where }) => clone(state.lots.get(where.id) ?? null),
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
          ...data
        };
        state.auctions.set(record.id, clone(record));
        return clone(record);
      },
      findMany: async ({ where }) => {
        const items = [...state.auctions.values()].filter((auction) => {
          return (
            auction.status === where.status &&
            new Date(auction.endAt).getTime() <= new Date(where.endAt.lte).getTime()
          );
        });

        return clone(items);
      },
      findUnique: async ({ where, include }) => {
        const auction = state.auctions.get(where.id);
        if (!auction) {
          return null;
        }

        if (include?.lot || include?.highestBid) {
          return clone({ ...auction, lot: null, highestBid: auction.highestBid ?? null });
        }

        return clone(auction);
      },
      update: async ({ where, data }) => {
        const auction = state.auctions.get(where.id);
        const updated = { ...auction, ...data };
        state.auctions.set(where.id, clone(updated));
        return clone(updated);
      }
    },
    order: {
      findMany: async ({ where }) => {
        const items = [...state.orders.values()].filter((order) => {
          return (
            order.pickupStatus === where.pickupStatus &&
            new Date(order.pickupWindowEndAt).getTime() <= new Date(where.pickupWindowEndAt.lte).getTime()
          );
        });

        return clone(items);
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
        const updated = { ...order, ...data };
        state.orders.set(where.id, clone(updated));
        return clone(updated);
      },
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
          ...data
        };
        state.orders.set(record.id, clone(record));
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
          resolvedAt: null
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
  const tradesService = new TradesService(prisma);
  const jobs = new ApiJobsService(prisma, tradesService);

  await prisma.lot.create({
    data: {
      id: "lot-1",
      storeId: "store-1",
      categoryId: "cat-1",
      storageCondition: "DRY",
      pickupWindowStartAt: new Date("2026-03-24T10:00:00.000Z"),
      pickupWindowEndAt: new Date("2026-03-24T12:00:00.000Z"),
      estimatedWeightKg: 100,
      finalWeightKg: null,
      grade: "A"
    }
  });

  await prisma.auction.create({
    data: {
      id: "auction-1",
      lotId: "lot-1",
      startAt: new Date("2026-03-24T08:00:00.000Z"),
      endAt: new Date("2026-03-24T09:00:00.000Z"),
      reservePriceSekPerKg: 12,
      status: "LIVE"
    }
  });

  await prisma.order.create({
    data: {
      id: "order-1",
      lotId: "lot-1",
      buyerId: "buyer-1",
      finalPriceSekPerKg: 15,
      status: "CONFIRMED",
      pickupStatus: "SCHEDULED",
      pickupWindowEndAt: new Date("2026-03-24T10:00:00.000Z")
    }
  });

  const sweepResult = await jobs.runSweep(new Date("2026-03-24T11:00:00.000Z"));

  assert.equal(sweepResult.endAuction.scanned, 1);
  assert.equal(sweepResult.endAuction.processed, 1);
  assert.equal(sweepResult.noShow.scanned, 1);
  assert.equal(sweepResult.noShow.processed, 1);
  assert.equal(prisma.__state.auctions.get("auction-1").status, "VOID");
  assert.equal(prisma.__state.lots.get("lot-1").status, "EXPIRED");
  assert.equal(prisma.__state.orders.get("order-1").pickupStatus, "NO_SHOW");
}

await main();
