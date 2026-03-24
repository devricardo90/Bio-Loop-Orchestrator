import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const main = readFileSync(new URL("../src/main.ts", import.meta.url), "utf8");
const module = readFileSync(
  new URL("../src/app.module.ts", import.meta.url),
  "utf8"
);
const controller = readFileSync(
  new URL("../src/app.controller.ts", import.meta.url),
  "utf8"
);
const authController = readFileSync(
  new URL("../src/auth/auth.controller.ts", import.meta.url),
  "utf8"
);
const authService = readFileSync(new URL("../src/auth/auth.service.ts", import.meta.url), "utf8");
const tradesController = readFileSync(new URL("../src/trades/trades.controller.ts", import.meta.url), "utf8");
const tradesService = readFileSync(new URL("../src/trades/trades.service.ts", import.meta.url), "utf8");
const tradesValidators = readFileSync(new URL("../src/trades/trades.validators.ts", import.meta.url), "utf8");
const tradesModule = readFileSync(new URL("../src/trades/trades.module.ts", import.meta.url), "utf8");
const envExample = readFileSync(new URL("../.env.example", import.meta.url), "utf8");

assert.match(main, /NestFactory\.create/);
assert.match(main, /enableCors/);
assert.match(main, /ALLOWED_ORIGINS/);
assert.match(module, /AppController/);
assert.match(module, /AuthModule/);
assert.match(controller, /@Get\("health"\)/);
assert.match(authController, /@Get\("csrf"\)/);
assert.match(authController, /@Post\("login"\)/);
assert.match(authController, /@Post\("refresh"\)/);
assert.match(authController, /@Post\("logout"\)/);
assert.match(authService, /createLoginSession/);
assert.match(authService, /rotateSession/);
assert.match(tradesController, /@Post\(":auctionId\/bids"\)/);
assert.match(tradesService, /placeBid/);
assert.match(tradesService, /endAuction/);
assert.match(tradesValidators, /normalizePlaceBidInput/);
assert.match(tradesModule, /TradesController/);
assert.match(envExample, /COOKIE_SECURE=false/);
