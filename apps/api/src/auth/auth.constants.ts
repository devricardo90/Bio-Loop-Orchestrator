export const AUTH_COOKIE_NAMES = {
  accessToken: "access_token",
  refreshToken: "refresh_token",
  csrfToken: "csrf_token"
} as const;

export const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://app.seudominio.com",
  "https://admin.seudominio.com"
] as const;

export const DEFAULT_COOKIE_SAMESITE = "Lax" as const;
