import assert from "node:assert/strict";
import { AdminController } from "../dist/admin/admin.controller.js";
import { AdminService } from "../dist/admin/admin.service.js";

function createFakePrisma() {
  const state = {
    buyers: new Map(),
    buyerApprovals: new Map(),
    disputes: new Map(),
    disputeResolutions: new Map(),
    orders: new Map(),
    auditLogs: [],
    mutationIdempotency: new Map()
  };

  const clone = (value) => JSON.parse(JSON.stringify(value));

  const prisma = {
    $transaction: async (fn) => fn(prisma),
    buyer: {
      create: async ({ data }) => {
        const record = {
          id: data.id ?? `buyer_${state.buyers.size + 1}`,
          approved: false,
          reputation: 0,
          radiusKmDefault: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...data
        };
        state.buyers.set(record.id, clone(record));
        return clone(record);
      },
      findUnique: async ({ where }) => clone(state.buyers.get(where.id) ?? null),
      update: async ({ where, data }) => {
        const buyer = state.buyers.get(where.id);
        if (!buyer) {
          throw new Error("buyer not found");
        }

        const updated = { ...buyer, ...data, updatedAt: new Date().toISOString() };
        state.buyers.set(where.id, clone(updated));
        return clone(updated);
      }
    },
    buyerApproval: {
      upsert: async ({ where, create, update }) => {
        const existing = state.buyerApprovals.get(where.buyerId);
        const record = existing
          ? { ...existing, ...update, updatedAt: new Date().toISOString() }
          : {
              id: `approval_${state.buyerApprovals.size + 1}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              ...create
            };

        state.buyerApprovals.set(where.buyerId, clone(record));
        return clone(record);
      }
    },
    dispute: {
      create: async ({ data }) => {
        const record = {
          id: data.id ?? `dispute_${state.disputes.size + 1}`,
          orderId: data.orderId,
          status: data.status ?? "OPEN",
          reason: data.reason ?? "NO_SHOW",
          openedAt: new Date().toISOString(),
          resolvedAt: null,
          openedByUserId: data.openedByUserId ?? null,
          resolvedByUserId: data.resolvedByUserId ?? null
        };
        state.disputes.set(record.id, clone(record));
        return clone(record);
      },
      findMany: async ({ where, skip, take }) => {
        let items = [...state.disputes.values()].filter((dispute) =>
          where?.status ? dispute.status === where.status : true
        );
        items = items.filter((dispute) => (where?.reason ? dispute.reason === where.reason : true));
        items = items.slice(skip ?? 0, (skip ?? 0) + (take ?? items.length));

        return clone(items);
      },
      count: async ({ where }) => {
        const items = [...state.disputes.values()].filter((dispute) =>
          where?.status ? dispute.status === where.status : true
        );
        return items.filter((dispute) => (where?.reason ? dispute.reason === where.reason : true)).length;
      },
      findUnique: async ({ where, include }) => {
        const dispute = state.disputes.get(where.id);
        if (!dispute) {
          return null;
        }

        const resolution = [...state.disputeResolutions.values()].find((entry) => entry.disputeId === dispute.id) ?? null;
        return clone({
          ...dispute,
          order: include?.order ? state.orders.get(dispute.orderId) ?? null : undefined,
          resolution: include?.resolution ? resolution : undefined
        });
      },
      update: async ({ where, data }) => {
        const dispute = state.disputes.get(where.id);
        if (!dispute) {
          throw new Error("dispute not found");
        }

        const updated = { ...dispute, ...data };
        state.disputes.set(where.id, clone(updated));
        return clone(updated);
      }
    },
    disputeResolution: {
      upsert: async ({ where, create, update }) => {
        const existing = state.disputeResolutions.get(where.disputeId);
        const record = existing
          ? { ...existing, ...update }
          : {
              id: `resolution_${state.disputeResolutions.size + 1}`,
              resolvedAt: new Date().toISOString(),
              ...create
            };

        state.disputeResolutions.set(where.disputeId, clone(record));
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
          ...data
        };
        state.orders.set(record.id, clone(record));
        return clone(record);
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
    auditLog: {
      create: async ({ data }) => {
        state.auditLogs.push(clone(data));
        return clone({ id: `audit_${state.auditLogs.length}`, ...data, createdAt: new Date().toISOString() });
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
    },
    __state: state
  };

  return prisma;
}

async function main() {
  const prisma = createFakePrisma();
  const service = new AdminService(prisma);
  const controller = new AdminController(service);

  const buyer = await prisma.buyer.create({
    data: {
      id: "buyer-1",
      name: "Admin Buyer",
      approved: false,
      radiusKmDefault: 50,
      reputation: 42
    }
  });

  const approval = await controller.approveBuyer("buyer-1", {
    decision: "APPROVE",
    reason: "MANUAL_REVIEW",
    reviewerId: "user-1",
    notes: "approved for admin slice"
  }, {
    user: { id: "user-1", role: "PLATFORM_ADMIN" },
    requestId: "req-approve-1",
    headers: {}
  });

  const repeatedApproval = await controller.approveBuyer("buyer-1", {
    decision: "APPROVE",
    reason: "MANUAL_REVIEW",
    reviewerId: "user-1",
    notes: "approved for admin slice"
  }, {
    user: { id: "user-1", role: "PLATFORM_ADMIN" },
    requestId: "req-approve-2",
    headers: {}
  });

  assert.equal(approval.approval.buyerId, buyer.id);
  assert.equal(approval.approval.status, "APPROVED");
  assert.equal(repeatedApproval.approval.id, approval.approval.id);
  assert.equal(prisma.__state.buyers.get("buyer-1").approved, true);
  assert.equal(prisma.__state.auditLogs.length, 1);

  await prisma.order.create({
    data: {
      id: "order-1",
      lotId: "lot-1",
      buyerId: "buyer-1",
      finalPriceSekPerKg: 15,
      status: "CONFIRMED",
      pickupStatus: "NO_SHOW"
    }
  });

  await prisma.dispute.create({
    data: {
      id: "dispute-1",
      orderId: "order-1",
      reason: "NO_SHOW",
      status: "OPEN"
    }
  });

  await prisma.dispute.create({
    data: {
      id: "dispute-2",
      orderId: "order-1",
      reason: "QUALITY_ISSUE",
      status: "RESOLVED"
    }
  });

  const openDisputes = await controller.listDisputes({ status: "OPEN" });
  assert.equal(openDisputes.disputes.length, 1);
  assert.equal(openDisputes.disputes[0].id, "dispute-1");
  assert.equal(openDisputes.pagination.total, 1);

  const resolved = await controller.resolveDispute("dispute-1", {
    decision: "SETTLE",
    reviewerId: "user-2",
    note: "settled via admin review"
  }, {
    user: { id: "user-2", role: "PLATFORM_ADMIN" },
    requestId: "req-dispute-1",
    headers: {}
  });

  const repeatedResolution = await controller.resolveDispute("dispute-1", {
    decision: "SETTLE",
    reviewerId: "user-2",
    note: "settled via admin review"
  }, {
    user: { id: "user-2", role: "PLATFORM_ADMIN" },
    requestId: "req-dispute-2",
    headers: {}
  });

  assert.equal(resolved.dispute.status, "RESOLVED");
  assert.equal(repeatedResolution.dispute.id, resolved.dispute.id);
  assert.equal(prisma.__state.orders.get("order-1").status, "SETTLED");
  assert.equal(prisma.__state.disputeResolutions.get("dispute-1").decision, "SETTLE");
  assert.equal(prisma.__state.auditLogs.length, 2);
}

await main();
