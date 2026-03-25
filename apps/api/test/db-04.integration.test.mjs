import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

async function main() {
  const schema = readFileSync(new URL("../prisma/schema.prisma", import.meta.url), "utf8");
  const tradesService = readFileSync(new URL("../src/trades/trades.service.ts", import.meta.url), "utf8");
  const billingService = readFileSync(new URL("../src/billing/billing.service.ts", import.meta.url), "utf8");

  assert.match(schema, /@@index\(\[approved, reputation, name\]\)/);
  assert.match(schema, /@@index\(\[status, endAt, createdAt\]\)/);
  assert.match(schema, /@@index\(\[status, pickupCompletedAt\]\)/);
  assert.match(schema, /@@index\(\[pickupStatus, pickupWindowEndAt\]\)/);
  assert.match(schema, /@@index\(\[issuedAt, status\]\)/);
  assert.match(tradesService, /buyerWorkspaceAuctionSelect/);
  assert.match(tradesService, /select: buyerWorkspaceAuctionSelect/);
  assert.match(billingService, /billingOrderSelect/);
  assert.match(billingService, /persistedInvoiceSelect/);
}

await main();
