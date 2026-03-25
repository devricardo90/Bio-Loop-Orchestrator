import assert from "node:assert/strict";
import { BadRequestException } from "@nestjs/common";
import { ApiErrorFilter } from "../dist/common/api-error.filter.js";
import { AdminController } from "../dist/admin/admin.controller.js";
import { AdminService } from "../dist/admin/admin.service.js";
import { normalizeListBuyersQuery, normalizeListDisputesQuery } from "../dist/admin/admin.validators.js";

function createFakePrisma() {
  const state = {
    buyers: new Map(),
    buyerApprovals: new Map(),
    disputes: new Map()
  };

  const clone = (value) => JSON.parse(JSON.stringify(value));

  const prisma = {
    $transaction: async (fn) => fn(prisma),
    buyer: {
      findMany: async ({ where, skip, take, select }) => {
        let buyers = [...state.buyers.values()];

        const applyBuyerFilter = (filter, items) => {
          let next = items;
          if (filter.OR && filter.OR.some((entry) => entry.metadata?.path)) {
            next = next.filter((buyer) =>
              filter.OR.some((entry) => {
                const metadata = buyer.metadata ?? {};
                const [path] = entry.metadata.path;
                return metadata[path] === entry.metadata.equals;
              })
            );
          } else if (filter.OR) {
            next = next.filter((buyer) =>
              filter.OR.some((entry) => {
                if (entry.id?.contains) {
                  return buyer.id.includes(entry.id.contains);
                }

                if (entry.name?.contains) {
                  return buyer.name.toLowerCase().includes(String(entry.name.contains).toLowerCase());
                }

                return false;
              })
            );
          }

          if (filter.approval?.is?.status) {
            next = next.filter((buyer) => state.buyerApprovals.get(buyer.id)?.status === filter.approval.is.status);
          }

          if (filter.approved !== undefined) {
            next = next.filter((buyer) => buyer.approved === filter.approved);
          }

          return next;
        };

        if (where?.AND) {
          for (const filter of where.AND) {
            buyers = applyBuyerFilter(filter, buyers);
          }
        } else if (where) {
          buyers = applyBuyerFilter(where, buyers);
        }

        buyers = buyers.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
        buyers = buyers.slice(skip ?? 0, (skip ?? 0) + (take ?? buyers.length));

        return clone(
          buyers.map((buyer) => ({
            ...buyer,
            approval: select?.approval ? state.buyerApprovals.get(buyer.id) ?? null : undefined
          }))
        );
      },
      count: async ({ where } = {}) => {
        const items = await prisma.buyer.findMany({ where, select: { approval: true } });
        return items.length;
      }
    },
    dispute: {
      findMany: async ({ where, skip, take }) => {
        let disputes = [...state.disputes.values()];

        const applyDisputeFilter = (filter, items) => {
          let next = items;
          if (filter.status) {
            next = next.filter((dispute) => dispute.status === filter.status);
          }
          if (filter.reason) {
            next = next.filter((dispute) => dispute.reason === filter.reason);
          }
          if (filter.order?.lot?.OR) {
            next = next.filter((dispute) =>
              filter.order.lot.OR.some((entry) => {
                const metadata = dispute.order?.lot?.metadata ?? {};
                const [path] = entry.metadata.path;
                return metadata[path] === entry.metadata.equals;
              })
            );
          }
          return next;
        };

        if (where?.AND) {
          for (const filter of where.AND) {
            disputes = applyDisputeFilter(filter, disputes);
          }
        } else if (where) {
          disputes = applyDisputeFilter(where, disputes);
        }

        disputes = disputes.sort((left, right) => right.openedAt.localeCompare(left.openedAt));
        return clone(disputes.slice(skip ?? 0, (skip ?? 0) + (take ?? disputes.length)));
      },
      count: async ({ where } = {}) => {
        let disputes = [...state.disputes.values()];
        const found = await prisma.dispute.findMany({ where });
        disputes = found;
        return disputes.length;
      }
    },
    __state: state
  };

  return prisma;
}

async function main() {
  const prisma = createFakePrisma();
  prisma.__state.buyers.set("buyer-1", {
    id: "buyer-1",
    name: "GrainWorks AB",
    approved: true,
    reputation: 92,
    updatedAt: "2026-03-25T11:00:00.000Z",
    metadata: { source: "scenario_seed" }
  });
  prisma.__state.buyers.set("buyer-2", {
    id: "buyer-2",
    name: "Nova Brew Labs",
    approved: false,
    reputation: 44,
    updatedAt: "2026-03-25T10:00:00.000Z",
    metadata: { source: "scenario_seed" }
  });
  prisma.__state.buyers.set("buyer-3", {
    id: "buyer-3",
    name: "Stockholms Stadsmission",
    approved: false,
    reputation: 0,
    updatedAt: "2026-03-25T09:30:00.000Z",
    metadata: { source: "sweden_real_import", dataset: "sweden-supermarkets" }
  });
  prisma.__state.buyers.set("buyer-4", {
    id: "buyer-4",
    name: "Harbor Food Systems",
    approved: false,
    reputation: 61,
    updatedAt: "2026-03-25T09:00:00.000Z",
    metadata: { source: "scenario_seed" }
  });
  prisma.__state.buyerApprovals.set("buyer-1", {
    id: "approval-1",
    buyerId: "buyer-1",
    status: "APPROVED",
    decision: "APPROVE",
    reason: "MANUAL_REVIEW",
    reviewerId: "admin-1",
    reviewedAt: "2026-03-25T11:00:00.000Z",
    notes: null,
    createdAt: "2026-03-25T11:00:00.000Z",
    updatedAt: "2026-03-25T11:00:00.000Z"
  });
  prisma.__state.disputes.set("dispute-1", {
    id: "dispute-1",
    orderId: "order-1",
    reason: "NO_SHOW",
    status: "OPEN",
    openedAt: "2026-03-25T08:00:00.000Z",
    resolvedAt: null,
    order: { lot: { metadata: { source: "scenario_seed" } } }
  });
  prisma.__state.disputes.set("dispute-2", {
    id: "dispute-2",
    orderId: "order-2",
    reason: "QUALITY_ISSUE",
    status: "RESOLVED",
    openedAt: "2026-03-25T07:00:00.000Z",
    resolvedAt: "2026-03-25T09:00:00.000Z",
    order: { lot: { metadata: { source: "sweden_real_import", dataset: "sweden-supermarkets" } } }
  });

  const service = new AdminService(prisma);
  const controller = new AdminController(service);

  const buyers = await controller.listBuyers({ search: "brew", limit: 1, offset: 0 });
  assert.equal(buyers.buyers.length, 1);
  assert.equal(buyers.buyers[0].buyerId, "buyer-2");
  assert.equal(buyers.buyers[0].catalog.scope, "demo");
  assert.equal(buyers.pagination.limit, 1);
  assert.equal(buyers.pagination.hasMore, false);

  const mixedBuyers = await controller.listBuyers({ catalogScope: "all", limit: 10, offset: 0 });
  assert.equal(mixedBuyers.buyers.length, 4);
  assert.equal(mixedBuyers.buyers.find((buyer) => buyer.buyerId === "buyer-3")?.catalog.scope, "real");

  const realBuyers = await controller.listBuyers({ catalogScope: "real", limit: 10, offset: 0 });
  assert.equal(realBuyers.buyers.length, 1);
  assert.equal(realBuyers.buyers[0].buyerId, "buyer-3");
  assert.equal(realBuyers.buyers[0].catalog.dataset, "sweden-supermarkets");

  const disputes = await controller.listDisputes({ reason: "NO_SHOW", limit: 10, offset: 0 });
  assert.equal(disputes.disputes.length, 1);
  assert.equal(disputes.disputes[0].id, "dispute-1");
  assert.equal(disputes.disputes[0].catalog.scope, "demo");
  assert.equal(disputes.pagination.total, 1);

  const allDisputes = await controller.listDisputes({ catalogScope: "all", limit: 10, offset: 0 });
  assert.equal(allDisputes.disputes.length, 2);
  assert.equal(allDisputes.disputes.find((dispute) => dispute.id === "dispute-2")?.catalog.scope, "real");

  assert.deepEqual(normalizeListBuyersQuery({ status: "APPROVED", search: "grain", catalogScope: "all", limit: "10", offset: "5" }), {
    status: "APPROVED",
    search: "grain",
    catalogScope: "all",
    limit: 10,
    offset: 5
  });
  assert.deepEqual(normalizeListDisputesQuery({ status: "OPEN", reason: "NO_SHOW", limit: "10" }), {
    status: "OPEN",
    reason: "NO_SHOW",
    catalogScope: "demo",
    limit: 10
  });

  const filter = new ApiErrorFilter();
  const responseState = { statusCode: 0, body: null };
  filter.catch(new BadRequestException({ code: "INVALID_QUERY", message: "query invalid", details: { field: "limit" } }), {
    switchToHttp: () => ({
      getResponse: () => ({
        status(code) {
          responseState.statusCode = code;
          return this;
        },
        json(body) {
          responseState.body = body;
        }
      }),
      getRequest: () => ({
        requestId: "req-16",
        header: () => undefined
      })
    })
  });

  assert.equal(responseState.statusCode, 400);
  assert.equal(responseState.body.code, "INVALID_QUERY");
  assert.equal(responseState.body.requestId, "req-16");
}

await main();
