import assert from "node:assert/strict";
import { Prisma } from "@prisma/client";
import { TradesService } from "../dist/trades/trades.service.js";

function createFakePrisma() {
  const state = {
    buyers: new Map(),
    auctions: new Map(),
    bids: new Map(),
    orders: new Map(),
    pickupProofs: new Map(),
    disputes: new Map(),
    auditLogs: [],
    mutationIdempotency: new Map()
  };

  const clone = (value) => JSON.parse(JSON.stringify(value));

  const prisma = {
    __state: state,
    $transaction: async (fn) => fn(prisma),
    buyer: {
      findUnique: async ({ where }) => clone(state.buyers.get(where.id) ?? null)
    },
    auction: {
      findUnique: async ({ where, include }) => {
        const auction = state.auctions.get(where.id);
        if (!auction) {
          return null;
        }

        return clone({
          ...auction,
          lot: include?.lot ? { id: auction.lotId } : undefined,
          highestBid: include?.highestBid && auction.highestBidId ? state.bids.get(auction.highestBidId) ?? null : undefined
        });
      },
      update: async ({ where, data }) => {
        const auction = state.auctions.get(where.id);
        const updated = { ...auction, ...data };
        state.auctions.set(where.id, clone(updated));
        return clone(updated);
      }
    },
    bid: {
      create: async ({ data }) => {
        const record = {
          id: `bid_${state.bids.size + 1}`,
          auctionId: data.auctionId,
          buyerId: data.buyerId,
          priceSekPerKg: data.priceSekPerKg,
          createdAt: new Date().toISOString()
        };
        state.bids.set(record.id, clone(record));
        return clone(record);
      }
    },
    order: {
      findUnique: async ({ where, include }) => {
        const order = state.orders.get(where.id);
        if (!order) {
          return null;
        }

        return clone({
          ...order,
          dispute: include?.dispute ? state.disputes.get(order.id) ?? null : undefined
        });
      },
      update: async ({ where, data }) => {
        const order = state.orders.get(where.id);
        const updated = { ...order, ...data, updatedAt: new Date().toISOString() };
        state.orders.set(where.id, clone(updated));
        return clone(updated);
      }
    },
    pickupProof: {
      create: async ({ data }) => {
        const record = {
          id: `proof_${state.pickupProofs.size + 1}`,
          orderId: data.orderId,
          type: data.type,
          url: data.url,
          createdAt: new Date().toISOString()
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
          resolvedAt: null
        };
        state.disputes.set(record.orderId, clone(record));
        return clone(record);
      },
      update: async ({ where, data }) => {
        const current = state.disputes.get(where.orderId);
        const updated = { ...current, ...data };
        state.disputes.set(where.orderId, clone(updated));
        return clone(updated);
      }
    },
    auditLog: {
      create: async ({ data }) => {
        state.auditLogs.push(clone(data));
        return clone({ id: `audit_${state.auditLogs.length}`, ...data });
      }
    },
    mutationIdempotency: {
      create: async ({ data }) => {
        const key = `${data.scope}:${data.actorKey}:${data.key}`;
        if (state.mutationIdempotency.has(key)) {
          const error = new Error("unique constraint");
          error.code = "P2002";
          throw error;
        }

        state.mutationIdempotency.set(key, clone(data));
        return clone(data);
      },
      findUnique: async ({ where }) => {
        const key = `${where.scope_actorKey_key.scope}:${where.scope_actorKey_key.actorKey}:${where.scope_actorKey_key.key}`;
        return clone(state.mutationIdempotency.get(key) ?? null);
      },
      update: async ({ where, data }) => {
        const key = `${where.scope_actorKey_key.scope}:${where.scope_actorKey_key.actorKey}:${where.scope_actorKey_key.key}`;
        const current = state.mutationIdempotency.get(key);
        const updated = { ...current, ...data };
        state.mutationIdempotency.set(key, clone(updated));
        return clone(updated);
      }
    }
  };

  return prisma;
}

async function main() {
  const prisma = createFakePrisma();
  const service = new TradesService(prisma);
  const actor = { actor: { id: "user-buyer-1", role: "BUYER_ADMIN" }, source: "http" };

  prisma.__state.buyers.set(
    "buyer-1",
    { id: "buyer-1", approved: true, name: "Buyer 1", reputation: 90, city: "Stockholm", metadata: null }
  );
  prisma.__state.auctions.set("auction-1", {
    id: "auction-1",
    lotId: "lot-1",
    reservePriceSekPerKg: new Prisma.Decimal(5),
    startAt: new Date("2026-03-25T08:00:00.000Z").toISOString(),
    endAt: new Date("2026-03-25T10:00:00.000Z").toISOString(),
    status: "LIVE",
    highestBidId: null,
    createdAt: new Date("2026-03-25T08:00:00.000Z").toISOString(),
    updatedAt: new Date("2026-03-25T08:00:00.000Z").toISOString()
  });

  const bid = await service.placeBid(
    { auctionId: "auction-1", buyerId: "buyer-1", priceSekPerKg: 6.2 },
    actor
  );
  const repeatedBid = await service.placeBid(
    { auctionId: "auction-1", buyerId: "buyer-1", priceSekPerKg: 6.2 },
    actor
  );

  assert.equal(bid.id, repeatedBid.id);
  assert.equal(prisma.__state.bids.size, 1);
  assert.equal(prisma.__state.auditLogs.length, 1);

  prisma.__state.orders.set("order-1", {
    id: "order-1",
    lotId: "lot-1",
    buyerId: "buyer-1",
    finalPriceSekPerKg: new Prisma.Decimal(6.2),
    status: "CREATED",
    pickupStatus: "PENDING",
    pickupWindowStartAt: null,
    pickupWindowEndAt: null,
    pickupScheduledAt: null,
    pickupCompletedAt: null,
    createdAt: new Date("2026-03-25T08:30:00.000Z").toISOString(),
    updatedAt: new Date("2026-03-25T08:30:00.000Z").toISOString()
  });

  const schedule = await service.schedulePickup(
    {
      orderId: "order-1",
      pickupWindow: {
        startAt: "2099-03-25T10:00:00.000Z",
        endAt: "2099-03-25T11:00:00.000Z"
      }
    },
    actor
  );
  const repeatedSchedule = await service.schedulePickup(
    {
      orderId: "order-1",
      pickupWindow: {
        startAt: "2099-03-25T10:00:00.000Z",
        endAt: "2099-03-25T11:00:00.000Z"
      }
    },
    actor
  );

  assert.equal(schedule.order.id, repeatedSchedule.order.id);
  assert.equal(prisma.__state.auditLogs.length, 2);

  const pod = await service.recordPickupProof(
    {
      orderId: "order-1",
      type: "PHOTO",
      url: "https://cdn.bioloop.dev/proofs/order-1.jpg"
    },
    actor
  );
  const repeatedPod = await service.recordPickupProof(
    {
      orderId: "order-1",
      type: "PHOTO",
      url: "https://cdn.bioloop.dev/proofs/order-1.jpg"
    },
    actor
  );

  assert.equal(pod.proof.id, repeatedPod.proof.id);
  assert.equal(prisma.__state.pickupProofs.size, 1);
  assert.equal(prisma.__state.orders.get("order-1").status, "SETTLED");
  assert.equal(prisma.__state.auditLogs.length, 3);

  prisma.__state.orders.set("order-2", {
    id: "order-2",
    lotId: "lot-2",
    buyerId: "buyer-1",
    finalPriceSekPerKg: new Prisma.Decimal(5.4),
    status: "CONFIRMED",
    pickupStatus: "SCHEDULED",
    pickupWindowStartAt: new Date("2026-03-20T10:00:00.000Z").toISOString(),
    pickupWindowEndAt: new Date("2026-03-20T11:00:00.000Z").toISOString(),
    pickupScheduledAt: new Date("2026-03-20T09:00:00.000Z").toISOString(),
    pickupCompletedAt: null,
    createdAt: new Date("2026-03-20T08:30:00.000Z").toISOString(),
    updatedAt: new Date("2026-03-20T08:30:00.000Z").toISOString()
  });

  const noShow = await service.markNoShow("order-2", { source: "job" });
  const repeatedNoShow = await service.markNoShow("order-2", { source: "job" });

  assert.equal(noShow.dispute.id, repeatedNoShow.dispute.id);
  assert.equal(prisma.__state.disputes.size, 1);
  assert.equal(prisma.__state.orders.get("order-2").pickupStatus, "NO_SHOW");
  assert.equal(prisma.__state.auditLogs.length, 4);
}

await main();
