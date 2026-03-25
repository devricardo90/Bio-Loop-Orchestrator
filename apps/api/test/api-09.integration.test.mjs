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
      findMany: async ({ include, select, where, skip, take }) => {
        let buyers = [...state.buyers.values()];

        if (where?.AND) {
          for (const filter of where.AND) {
            buyers = buyers.filter((buyer) => {
              if (filter.OR) {
                return filter.OR.some((entry) => {
                  if (entry.id?.contains) {
                    return buyer.id.includes(entry.id.contains);
                  }

                  if (entry.name?.contains) {
                    return buyer.name.toLowerCase().includes(String(entry.name.contains).toLowerCase());
                  }

                  return false;
                });
              }

              if (filter.approval?.is?.status) {
                return state.buyerApprovals.get(buyer.id)?.status === filter.approval.is.status;
              }

              if (filter.approved === false && filter.OR) {
                return buyer.approved === false;
              }

              return true;
            });
          }
        } else if (where?.approval?.is?.status) {
          buyers = buyers.filter((buyer) => state.buyerApprovals.get(buyer.id)?.status === where.approval.is.status);
        }

        buyers = buyers.sort((left, right) =>
          right.updatedAt.localeCompare(left.updatedAt)
        );
        buyers = buyers.slice(skip ?? 0, (skip ?? 0) + (take ?? buyers.length));

        return clone(
          buyers.map((buyer) => ({
            ...buyer,
            approval: include?.approval || select?.approval ? state.buyerApprovals.get(buyer.id) ?? null : undefined
          }))
        );
      },
      count: async ({ where } = {}) => {
        const buyers = await prisma.buyer.findMany({ where, include: { approval: true } });
        return buyers.length;
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
  assert.equal(result.pagination.total, 2);
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
