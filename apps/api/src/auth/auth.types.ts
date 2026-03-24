export type AuthRole = "SELLER_ADMIN" | "SELLER_OPS" | "BUYER_ADMIN" | "BUYER_OPS" | "PLATFORM_ADMIN";

export interface AuthUser {
  id: string;
  email: string;
  role: AuthRole;
}

export interface LoginRequestBody {
  email?: unknown;
  password?: unknown;
  role?: unknown;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}
