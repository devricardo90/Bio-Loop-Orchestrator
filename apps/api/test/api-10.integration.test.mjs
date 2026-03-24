import "reflect-metadata";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { AdminController } from "../dist/admin/admin.controller.js";
import { AuthService } from "../dist/auth/auth.service.js";
import { ADMIN_ROLES, BUYER_ROLES, ROLES_KEY, SELLER_ROLES } from "../dist/auth/roles.decorator.js";
import { RolesGuard } from "../dist/auth/roles.guard.js";
import { BillingController } from "../dist/billing/billing.controller.js";
import { OrdersController } from "../dist/trades/orders.controller.js";
import { TradesController } from "../dist/trades/trades.controller.js";

function createReflector(roles) {
  return {
    getAllAndOverride: () => roles
  };
}

function createExecutionContext(request) {
  return {
    getHandler: () => function handler() {},
    getClass: () => function controller() {},
    switchToHttp: () => ({
      getRequest: () => request
    })
  };
}

async function main() {
  const guardSource = readFileSync(new URL("../src/auth/roles.guard.ts", import.meta.url), "utf8");
  const adminSource = readFileSync(new URL("../src/admin/admin.controller.ts", import.meta.url), "utf8");
  const tradesSource = readFileSync(new URL("../src/trades/trades.controller.ts", import.meta.url), "utf8");
  const ordersSource = readFileSync(new URL("../src/trades/orders.controller.ts", import.meta.url), "utf8");
  const billingSource = readFileSync(new URL("../src/billing/billing.controller.ts", import.meta.url), "utf8");

  assert.match(guardSource, /RolesGuard/);
  assert.match(guardSource, /UnauthorizedException/);
  assert.match(guardSource, /ForbiddenException/);
  assert.match(adminSource, /@Roles\(\.\.\.ADMIN_ROLES\)/);
  assert.match(tradesSource, /@Roles\(\.\.\.BUYER_ROLES\)/);
  assert.match(ordersSource, /@Roles\(\.\.\.BUYER_ROLES\)/);
  assert.match(billingSource, /@Roles\(\.\.\.SELLER_ROLES\)/);

  assert.equal(ROLES_KEY, "bio-loop:roles");
  assert.deepEqual(ADMIN_ROLES, ["PLATFORM_ADMIN"]);
  assert.deepEqual(BUYER_ROLES, ["BUYER_ADMIN", "BUYER_OPS"]);
  assert.deepEqual(SELLER_ROLES, ["SELLER_ADMIN", "SELLER_OPS"]);

  assert.deepEqual(Reflect.getMetadata(ROLES_KEY, AdminController), ADMIN_ROLES);
  assert.deepEqual(Reflect.getMetadata(ROLES_KEY, TradesController), BUYER_ROLES);
  assert.deepEqual(Reflect.getMetadata(ROLES_KEY, OrdersController), BUYER_ROLES);
  assert.deepEqual(Reflect.getMetadata(ROLES_KEY, BillingController), SELLER_ROLES);

  const authService = new AuthService();
  const adminSession = authService.createLoginSession("admin@example.com", "PLATFORM_ADMIN");
  const buyerSession = authService.createLoginSession("buyer@example.com", "BUYER_OPS");
  const sellerSession = authService.createLoginSession("seller@example.com", "SELLER_ADMIN");

  const adminGuard = new RolesGuard(createReflector(["PLATFORM_ADMIN"]), authService);
  const buyerGuard = new RolesGuard(createReflector(BUYER_ROLES), authService);
  const sellerGuard = new RolesGuard(createReflector(SELLER_ROLES), authService);

  const adminRequest = { headers: { cookie: `refresh_token=${adminSession.refreshToken}` } };
  assert.equal(adminGuard.canActivate(createExecutionContext(adminRequest)), true);
  assert.equal(adminRequest.user.role, "PLATFORM_ADMIN");

  const buyerRequest = { headers: { cookie: `refresh_token=${buyerSession.refreshToken}` } };
  assert.equal(buyerGuard.canActivate(createExecutionContext(buyerRequest)), true);
  assert.equal(buyerRequest.user.role, "BUYER_OPS");

  const sellerRequest = { headers: { cookie: `refresh_token=${sellerSession.refreshToken}` } };
  assert.equal(sellerGuard.canActivate(createExecutionContext(sellerRequest)), true);
  assert.equal(sellerRequest.user.role, "SELLER_ADMIN");

  assert.throws(
    () => adminGuard.canActivate(createExecutionContext({ headers: { cookie: `refresh_token=${buyerSession.refreshToken}` } })),
    ForbiddenException
  );
  assert.throws(
    () => sellerGuard.canActivate(createExecutionContext({ headers: { cookie: `refresh_token=${adminSession.refreshToken}` } })),
    ForbiddenException
  );
  assert.throws(
    () => buyerGuard.canActivate(createExecutionContext({ headers: {} })),
    UnauthorizedException
  );
}

await main();
