import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";

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

const PASSWORD_HASH_VERSION = "scrypt:v1";
const PASSWORD_KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, PASSWORD_KEY_LENGTH).toString("hex");
  return `${PASSWORD_HASH_VERSION}$${salt}$${derivedKey}`;
}

export function verifyPassword(password: string, passwordHash: string | null | undefined): boolean {
  if (!passwordHash) {
    return false;
  }

  const [version, salt, storedHash] = passwordHash.split("$");
  if (version !== PASSWORD_HASH_VERSION || !salt || !storedHash) {
    return false;
  }

  const derivedKey = scryptSync(password, salt, PASSWORD_KEY_LENGTH);
  const storedKey = Buffer.from(storedHash, "hex");
  if (storedKey.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, storedKey);
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
