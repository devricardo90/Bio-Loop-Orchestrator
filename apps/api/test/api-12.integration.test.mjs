import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { AuthService } from "../dist/auth/auth.service.js";
import { hashPassword } from "../dist/auth/auth.utils.js";

function createFakePrisma() {
  const users = new Map();

  return {
    __users: users,
    user: {
      findUnique: async ({ where }) => {
        if (typeof where.email !== "string") {
          return null;
        }

        return users.get(where.email) ?? null;
      }
    }
  };
}

async function main() {
  const authServiceSource = readFileSync(new URL("../src/auth/auth.service.ts", import.meta.url), "utf8");
  const authControllerSource = readFileSync(new URL("../src/auth/auth.controller.ts", import.meta.url), "utf8");

  assert.match(authServiceSource, /authenticateUser/);
  assert.match(authServiceSource, /verifyPassword/);
  assert.match(authControllerSource, /UnauthorizedException\("invalid credentials"\)/);

  const prisma = createFakePrisma();
  prisma.__users.set("buyer.admin@bioloop.dev", {
    id: "user_buyer_admin",
    email: "buyer.admin@bioloop.dev",
    passwordHash: hashPassword("demo-password"),
    role: "BUYER_ADMIN"
  });

  const authService = new AuthService(prisma);

  const validSession = await authService.authenticateUser("buyer.admin@bioloop.dev", "demo-password", "BUYER_ADMIN");
  assert.ok(validSession);
  assert.equal(validSession.user.id, "user_buyer_admin");
  assert.equal(validSession.user.role, "BUYER_ADMIN");

  const invalidPasswordSession = await authService.authenticateUser(
    "buyer.admin@bioloop.dev",
    "wrong-password",
    "BUYER_ADMIN"
  );
  assert.equal(invalidPasswordSession, null);

  const invalidRoleSession = await authService.authenticateUser("buyer.admin@bioloop.dev", "demo-password", "SELLER_ADMIN");
  assert.equal(invalidRoleSession, null);

  const unknownUserSession = await authService.authenticateUser("unknown@bioloop.dev", "demo-password", "BUYER_ADMIN");
  assert.equal(unknownUserSession, null);
}

await main();
