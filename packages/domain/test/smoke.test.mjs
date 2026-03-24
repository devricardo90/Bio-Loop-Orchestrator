import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const indexFile = readFileSync(
  new URL("../src/index.ts", import.meta.url),
  "utf8"
);
const typesFile = readFileSync(
  new URL("../src/types.ts", import.meta.url),
  "utf8"
);
const schemasFile = readFileSync(
  new URL("../src/schemas.ts", import.meta.url),
  "utf8"
);
const stateMachineFile = readFileSync(
  new URL("../stateMachine.md", import.meta.url),
  "utf8"
);
const rulesFile = readFileSync(
  new URL("../rules.md", import.meta.url),
  "utf8"
);

assert.match(indexFile, /export \* from "\.\/types";/);
assert.match(indexFile, /export \* from "\.\/schemas";/);
assert.match(typesFile, /export const LOT_STATUSES/);
assert.match(typesFile, /export interface Auction/);
assert.match(typesFile, /export const DISPUTE_STATUSES/);
assert.match(typesFile, /export interface Dispute/);
assert.match(typesFile, /export const BUYER_APPROVAL_STATUSES/);
assert.match(typesFile, /export interface BuyerApproval/);
assert.match(typesFile, /export const INVOICE_STATUSES/);
assert.match(typesFile, /export interface Invoice/);
assert.match(typesFile, /export interface BillingReport/);
assert.match(schemasFile, /export const placeBidRequestSchema/);
assert.match(schemasFile, /export const schedulePickupResponseSchema/);
assert.match(schemasFile, /export const openDisputeRequestSchema/);
assert.match(schemasFile, /export const approveBuyerRequestSchema/);
assert.match(schemasFile, /export const invoiceSchema/);
assert.match(schemasFile, /export const invoiceDtoSchema/);
assert.match(schemasFile, /export const invoiceExportRequestSchema/);
assert.match(schemasFile, /export const billingReportSchema/);
assert.match(stateMachineFile, /`LIVE` \| `ENDED`/);
assert.match(stateMachineFile, /`CREATED` \| `CONFIRMED`/);
assert.match(stateMachineFile, /## Invoice/);
assert.match(stateMachineFile, /## Buyer Approval/);
assert.match(rulesFile, /A `Lot` may have at most one active `Auction`/);
assert.match(rulesFile, /PlaceBidRequest/);
assert.match(rulesFile, /DisputeDto/);
assert.match(rulesFile, /BuyerApprovalDto/);
assert.match(rulesFile, /InvoiceDto/);
