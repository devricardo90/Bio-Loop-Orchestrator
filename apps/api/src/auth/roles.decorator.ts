import { SetMetadata } from "@nestjs/common";
import type { AuthRole } from "./auth.types";

export const ROLES_KEY = "bio-loop:roles";

export const BUYER_ROLES: readonly AuthRole[] = ["BUYER_ADMIN", "BUYER_OPS"];
export const SELLER_ROLES: readonly AuthRole[] = ["SELLER_ADMIN", "SELLER_OPS"];
export const ADMIN_ROLES: readonly AuthRole[] = ["PLATFORM_ADMIN"];

export function Roles(...roles: AuthRole[]) {
  return SetMetadata(ROLES_KEY, roles);
}
