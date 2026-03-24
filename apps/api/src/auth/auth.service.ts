import { Injectable } from "@nestjs/common";
import { createToken } from "./auth.utils";
import type { AuthRole, AuthSession, AuthUser } from "./auth.types";

interface SessionRecord {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

@Injectable()
export class AuthService {
  private readonly sessionsByRefreshToken = new Map<string, SessionRecord>();

  createLoginSession(email: string, role: AuthRole): AuthSession {
    const user: AuthUser = {
      id: createToken("user"),
      email,
      role
    };

    return this.createSessionForUser(user);
  }

  rotateSession(refreshToken: string): AuthSession | null {
    const existing = this.sessionsByRefreshToken.get(refreshToken);
    if (!existing) {
      return null;
    }

    this.sessionsByRefreshToken.delete(refreshToken);
    return this.createSessionForUser(existing.user);
  }

  revokeSession(refreshToken: string | undefined): boolean {
    if (!refreshToken) {
      return false;
    }

    return this.sessionsByRefreshToken.delete(refreshToken);
  }

  validateCsrf(expectedToken: string | undefined, receivedToken: string | undefined): boolean {
    return Boolean(expectedToken && receivedToken && expectedToken === receivedToken);
  }

  getSessionByRefreshToken(refreshToken: string | undefined): SessionRecord | null {
    if (!refreshToken) {
      return null;
    }

    return this.sessionsByRefreshToken.get(refreshToken) ?? null;
  }

  private createSessionForUser(user: AuthUser): AuthSession {
    const now = Date.now();
    const accessToken = createToken("access");
    const refreshToken = createToken("refresh");
    const csrfToken = createToken("csrf");
    const accessTokenExpiresAt = new Date(now + 15 * 60 * 1000);
    const refreshTokenExpiresAt = new Date(now + 14 * 24 * 60 * 60 * 1000);

    const session: SessionRecord = {
      user,
      accessToken,
      refreshToken,
      csrfToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt
    };

    this.sessionsByRefreshToken.set(refreshToken, session);

    return {
      user,
      accessToken,
      refreshToken,
      csrfToken,
      accessTokenExpiresAt: accessTokenExpiresAt.toISOString(),
      refreshTokenExpiresAt: refreshTokenExpiresAt.toISOString()
    };
  }
}
