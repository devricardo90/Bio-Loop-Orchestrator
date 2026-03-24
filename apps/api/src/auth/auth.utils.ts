import { randomUUID } from "node:crypto";

export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "Lax" | "Strict" | "None";
  domain?: string;
  path?: string;
  maxAge?: number;
}

export function parseCookieHeader(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(";").reduce<Record<string, string>>((cookies, pair) => {
    const [rawKey, ...rawValue] = pair.trim().split("=");
    if (!rawKey) {
      return cookies;
    }

    cookies[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue.join("=") ?? "");
    return cookies;
  }, {});
}

export function serializeCookie(name: string, value: string, options: CookieOptions = {}): string {
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`];

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${Math.floor(options.maxAge)}`);
  }

  parts.push(`Path=${options.path ?? "/"}`);

  if (options.domain) {
    parts.push(`Domain=${options.domain}`);
  }

  if (options.httpOnly) {
    parts.push("HttpOnly");
  }

  if (options.secure) {
    parts.push("Secure");
  }

  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }

  return parts.join("; ");
}

export function createToken(prefix: string): string {
  return `${prefix}_${randomUUID().replaceAll("-", "")}`;
}

export function parseBooleanEnv(value: string | undefined, defaultValue = false): boolean {
  if (value === undefined) {
    return defaultValue;
  }

  return value.toLowerCase() === "true";
}

export function parseOrigins(value: string | undefined, fallback: readonly string[]): string[] {
  if (!value) {
    return [...fallback];
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}
