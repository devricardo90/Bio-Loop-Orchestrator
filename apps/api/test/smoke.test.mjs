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
const logger = readFileSync(
  new URL("../src/observability/structured-logger.ts", import.meta.url),
  "utf8"
);
const requestIdMiddleware = readFileSync(
  new URL("../src/observability/request-id.middleware.ts", import.meta.url),
  "utf8"
);
const authController = readFileSync(
  new URL("../src/auth/auth.controller.ts", import.meta.url),
  "utf8"
);
const authService = readFileSync(new URL("../src/auth/auth.service.ts", import.meta.url), "utf8");
const tradesController = readFileSync(new URL("../src/trades/trades.controller.ts", import.meta.url), "utf8");
const ordersController = readFileSync(new URL("../src/trades/orders.controller.ts", import.meta.url), "utf8");
const tradesService = readFileSync(new URL("../src/trades/trades.service.ts", import.meta.url), "utf8");
const tradesValidators = readFileSync(new URL("../src/trades/trades.validators.ts", import.meta.url), "utf8");
const tradesModule = readFileSync(new URL("../src/trades/trades.module.ts", import.meta.url), "utf8");
const adminController = readFileSync(new URL("../src/admin/admin.controller.ts", import.meta.url), "utf8");
const adminModule = readFileSync(new URL("../src/admin/admin.module.ts", import.meta.url), "utf8");
const adminService = readFileSync(new URL("../src/admin/admin.service.ts", import.meta.url), "utf8");
const apiJobsService = readFileSync(new URL("../src/jobs/api-jobs.service.ts", import.meta.url), "utf8");
const apiJobsModule = readFileSync(new URL("../src/jobs/api-jobs.module.ts", import.meta.url), "utf8");
const envExample = readFileSync(new URL("../.env.example", import.meta.url), "utf8");

assert.match(main, /NestFactory\.create/);
assert.match(main, /StructuredLogger/);
assert.match(main, /app\.useLogger/);
assert.match(main, /createRequestIdMiddleware/);
assert.match(main, /enableCors/);
assert.match(main, /ALLOWED_ORIGINS/);
assert.match(main, /SwaggerModule\.createDocument/);
assert.match(main, /openapi\.json/);
assert.match(main, /reference/);
assert.match(module, /AppController/);
assert.match(module, /AuthModule/);
assert.match(controller, /@Get\("health"\)/);
assert.match(controller, /@Get\("readiness"\)/);
assert.match(controller, /PrismaService/);
assert.match(controller, /ServiceUnavailableException/);
assert.match(logger, /requestCompleted/);
assert.match(logger, /StructuredLogger/);
assert.match(requestIdMiddleware, /x-request-id/);
assert.match(requestIdMiddleware, /X-Request-Id/);
assert.match(authController, /@Get\("csrf"\)/);
assert.match(authController, /@Post\("login"\)/);
assert.match(authController, /@Post\("refresh"\)/);
assert.match(authController, /@Post\("logout"\)/);
assert.match(authService, /createLoginSession/);
assert.match(authService, /rotateSession/);
assert.match(tradesController, /@Post\(":auctionId\/bids"\)/);
assert.match(ordersController, /@Post\(":orderId\/schedule-pickup"\)/);
assert.match(ordersController, /@Post\(":orderId\/pod"\)/);
assert.match(tradesService, /placeBid/);
assert.match(tradesService, /endAuction/);
assert.match(tradesService, /schedulePickup/);
assert.match(tradesService, /recordPickupProof/);
assert.match(tradesService, /markNoShow/);
assert.match(adminController, /@Post\("buyers\/:buyerId\/approve"\)/);
assert.match(adminController, /@Get\("disputes"\)/);
assert.match(adminController, /@Post\("disputes\/:disputeId\/resolve"\)/);
assert.match(adminService, /approveBuyer/);
assert.match(adminService, /listDisputes/);
assert.match(adminService, /resolveDispute/);
assert.match(adminModule, /AdminModule/);
assert.match(apiJobsService, /runEndAuctionSweep/);
assert.match(apiJobsService, /runNoShowSweep/);
assert.match(apiJobsModule, /ApiJobsModule/);
assert.match(tradesValidators, /normalizePlaceBidInput/);
assert.match(tradesModule, /TradesController/);
assert.match(tradesModule, /OrdersController/);
assert.match(envExample, /COOKIE_SECURE=false/);
