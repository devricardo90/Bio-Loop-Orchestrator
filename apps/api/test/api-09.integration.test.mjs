import assert from "node:assert/strict";
import { AdminController } from "../dist/admin/admin.controller.js";
import { AdminService } from "../dist/admin/admin.service.js";

function createFakePrisma() {
  const state = {
    buyers: new Map(),
    buyerApprovals: new Map()
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
      findMany: async ({ include }) => {
        const buyers = [...state.buyers.values()].sort((left, right) =>
          right.updatedAt.localeCompare(left.updatedAt)
        );

        return clone(
          buyers.map((buyer) => ({
            ...buyer,
            approval: include?.approval ? state.buyerApprovals.get(buyer.id) ?? null : undefined
          }))
        );
      },
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
    __state: state
  };

  return prisma;
}

async function main() {
  const prisma = createFakePrisma();
  const service = new AdminService(prisma);
  const controller = new AdminController(service);

  await prisma.buyer.create({
    data: {
      id: "buyer-1",
      name: "GrainWorks AB",
      approved: true,
      radiusKmDefault: 50,
      reputation: 92
    }
  });

  await prisma.buyer.create({
    data: {
      id: "buyer-2",
      name: "Nova Brew Labs",
      approved: false,
      radiusKmDefault: 30,
      reputation: 44
    }
  });

  await prisma.buyerApproval.upsert({
    where: { buyerId: "buyer-1" },
    create: {
      buyerId: "buyer-1",
      status: "APPROVED",
      decision: "APPROVE",
      reason: "MANUAL_REVIEW",
      reviewerId: "admin-1",
      reviewedAt: new Date("2026-03-24T09:00:00.000Z"),
      notes: "Approved after review."
    },
    update: {
      status: "APPROVED",
      decision: "APPROVE",
      reason: "MANUAL_REVIEW",
      reviewerId: "admin-1",
      reviewedAt: new Date("2026-03-24T09:00:00.000Z"),
      notes: "Approved after review."
    }
  });

  const result = await controller.listBuyers();

  assert.equal(result.buyers.length, 2);
  const approved = result.buyers.find((buyer) => buyer.buyerId === "buyer-1");
  const pending = result.buyers.find((buyer) => buyer.buyerId === "buyer-2");

  assert.ok(approved);
  assert.ok(pending);
  assert.equal(approved.status, "APPROVED");
  assert.equal(approved.approval?.decision, "APPROVE");
  assert.equal(approved.riskLabel, "Low risk");
  assert.equal(pending.status, "PENDING");
  assert.equal(pending.approval, null);
  assert.equal(pending.notes, "Buyer is waiting for the initial approval decision.");
}

await main();
