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
assert.match(schemasFile, /export const placeBidRequestSchema/);
assert.match(schemasFile, /export const schedulePickupResponseSchema/);
assert.match(stateMachineFile, /`LIVE` \| `ENDED`/);
assert.match(stateMachineFile, /`CREATED` \| `CONFIRMED`/);
assert.match(rulesFile, /A `Lot` may have at most one active `Auction`/);
assert.match(rulesFile, /PlaceBidRequest/);
