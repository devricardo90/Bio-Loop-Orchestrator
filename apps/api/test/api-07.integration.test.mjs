import assert from "node:assert/strict";
import { Prisma } from "@prisma/client";
import { BillingController } from "../dist/billing/billing.controller.js";
import { BillingService } from "../dist/billing/billing.service.js";

function createFakePrisma() {
  const state = {
    stores: new Map(),
    categories: new Map(),
    buyers: new Map(),
    lots: new Map(),
    orders: new Map(),
    disputes: new Map(),
    invoices: new Map(),
    invoiceFees: new Map(),
    billingExports: new Map()
  };

  const clone = (value) => JSON.parse(JSON.stringify(value));

  const prisma = {
    __state: state,
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
      }
    },
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
          pickupCompletedAt: null,
          ...data
        };
        state.orders.set(record.id, clone(record));
        return clone(record);
      },
      findMany: async ({ where, include }) => {
        const items = [...state.orders.values()].filter((order) => order.status === where.status);

        return clone(
          items.map((order) => ({
            ...order,
            lot: include?.lot ? state.lots.get(order.lotId) ?? null : undefined,
            dispute: include?.dispute ? state.disputes.get(order.id) ?? null : undefined,
            invoice: include?.invoice
              ? (() => {
                  const invoice = [...state.invoices.values()].find((entry) => entry.orderId === order.id) ?? null;
                  if (!invoice) {
                    return null;
                  }

                  return {
                    ...invoice,
                    fees: include.invoice.include?.fees
                      ? [...state.invoiceFees.values()].filter((fee) => fee.invoiceId === invoice.id)
                      : undefined
                  };
                })()
              : undefined
          }))
        );
      }
    },
    invoice: {
      upsert: async ({ where, create, update }) => {
        const existing = [...state.invoices.values()].find((entry) => entry.orderId === where.orderId) ?? null;
        const base = existing ?? { id: create.id };
        const record = {
          ...base,
          ...(existing ? update : create)
        };
        state.invoices.set(record.id, clone(record));
        return clone(record);
      },
      findMany: async ({ where }) => {
        const items = [...state.invoices.values()].filter((invoice) => {
          const issuedAt = new Date(invoice.issuedAt).getTime();
          return issuedAt >= new Date(where.issuedAt.gte).getTime() && issuedAt <= new Date(where.issuedAt.lte).getTime();
        });

        return clone(
          items.map((invoice) => ({
            ...invoice,
            fees: [...state.invoiceFees.values()].filter((fee) => fee.invoiceId === invoice.id)
          }))
        );
      },
      update: async ({ where, data }) => {
        const current = state.invoices.get(where.id);
        const record = { ...current, ...data };
        state.invoices.set(where.id, clone(record));
        return clone({
          ...record,
          fees: [...state.invoiceFees.values()].filter((fee) => fee.invoiceId === record.id)
        });
      }
    },
    invoiceFee: {
      deleteMany: async ({ where }) => {
        for (const [id, fee] of state.invoiceFees.entries()) {
          if (fee.invoiceId === where.invoiceId) {
            state.invoiceFees.delete(id);
          }
        }
      },
      createMany: async ({ data }) => {
        for (const item of data) {
          state.invoiceFees.set(item.id, clone(item));
        }
      }
    },
    billingExport: {
      create: async ({ data }) => {
        const record = { id: `billing_export_${state.billingExports.size + 1}`, ...data };
        state.billingExports.set(record.id, clone(record));
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
      }
    }
  };

  return prisma;
}

async function main() {
  const prisma = createFakePrisma();
  const service = new BillingService(prisma);
  const controller = new BillingController(service);

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
      estimatedWeightKg: new Prisma.Decimal(100),
      finalWeightKg: new Prisma.Decimal(95),
      grade: "A",
      status: "AWARDED"
    }
  });

  await prisma.order.create({
    data: {
      lotId: lot.id,
      buyerId: buyer.id,
      finalPriceSekPerKg: new Prisma.Decimal(15),
      status: "SETTLED",
      pickupStatus: "COMPLETED",
      pickupCompletedAt: new Date("2026-03-25T13:00:00.000Z")
    }
  });

  const summary = await controller.summary({
    fromAt: "2026-03-25T00:00:00.000Z",
    toAt: "2026-03-26T00:00:00.000Z"
  });

  assert.equal(summary.invoiceCount, 1);
  assert.equal(summary.currency, "SEK");
  assert.ok(summary.totalSek > 0);

  const exported = await controller.export({
    fromAt: "2026-03-25T00:00:00.000Z",
    toAt: "2026-03-26T00:00:00.000Z",
    format: "CSV"
  });

  assert.equal(exported.format, "CSV");
  assert.equal(exported.invoiceCount, 1);
  assert.match(exported.downloadName, /billing-/);
  assert.match(exported.content, /invoiceId/);
  assert.match(exported.content, /order_/);
  assert.equal(exported.invoices.length, 1);
  assert.equal(exported.invoices[0].status, "EXPORTED");
  assert.equal(exported.report.invoiceCount, 1);
  assert.equal(prisma.__state.billingExports.size, 1);
}

await main();
