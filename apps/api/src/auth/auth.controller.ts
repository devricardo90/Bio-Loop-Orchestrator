import { Body, Controller, Get, Headers, Post, Req, Res } from "@nestjs/common";
import { AUTH_COOKIE_NAMES, DEFAULT_COOKIE_SAMESITE } from "./auth.constants";
import { AuthService } from "./auth.service";
import type { AuthRole, LoginRequestBody } from "./auth.types";
import {
  createToken,
  parseBooleanEnv,
  parseCookieHeader,
  parseOrigins,
  serializeCookie
} from "./auth.utils";

const loginRoles: AuthRole[] = [
  "SELLER_ADMIN",
  "SELLER_OPS",
  "BUYER_ADMIN",
  "BUYER_OPS",
  "PLATFORM_ADMIN"
];

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("csrf")
  csrf(@Res({ passthrough: true }) res: any) {
    const csrfToken = createToken("csrf");
    this.attachCsrfCookie(res, csrfToken);

    return { csrfToken };
  }

  @Post("login")
  login(
    @Req() req: any,
    @Res({ passthrough: true }) res: any,
    @Body() body: LoginRequestBody,
    @Headers("x-csrf-token") csrfHeader?: string
  ) {
    this.assertCsrf(req, csrfHeader);

    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const role = this.parseRole(body.role);

    if (!email || !password) {
      throw new Error("email and password are required");
    }

    const session = this.authService.createLoginSession(email, role);
    this.attachSessionCookies(res, session);

    return { user: session.user, accessTokenExpiresAt: session.accessTokenExpiresAt };
  }

  @Post("refresh")
  refresh(@Req() req: any, @Res({ passthrough: true }) res: any, @Headers("x-csrf-token") csrfHeader?: string) {
    this.assertCsrf(req, csrfHeader);

    const cookies = parseCookieHeader(req.headers?.cookie);
    const session = this.authService.rotateSession(cookies[AUTH_COOKIE_NAMES.refreshToken]);
    if (!session) {
      throw new Error("invalid refresh token");
    }

    this.attachSessionCookies(res, session);
    return { user: session.user, accessTokenExpiresAt: session.accessTokenExpiresAt };
  }

  @Post("logout")
  logout(@Req() req: any, @Res({ passthrough: true }) res: any, @Headers("x-csrf-token") csrfHeader?: string) {
    this.assertCsrf(req, csrfHeader);

    const cookies = parseCookieHeader(req.headers?.cookie);
    this.authService.revokeSession(cookies[AUTH_COOKIE_NAMES.refreshToken]);
    this.clearSessionCookies(res);

    return { ok: true };
  }

  private parseRole(value: unknown): AuthRole {
    if (typeof value === "string" && loginRoles.includes(value as AuthRole)) {
      return value as AuthRole;
    }

    return "SELLER_ADMIN";
  }

  private assertCsrf(req: any, csrfHeader?: string) {
    const cookies = parseCookieHeader(req.headers?.cookie);
    const cookieToken = cookies[AUTH_COOKIE_NAMES.csrfToken];
    if (!this.authService.validateCsrf(cookieToken, csrfHeader)) {
      throw new Error("invalid csrf token");
    }
  }

  private attachSessionCookies(res: any, session: { accessToken: string; refreshToken: string; csrfToken: string }) {
    this.attachAuthCookie(res, AUTH_COOKIE_NAMES.accessToken, session.accessToken, 15 * 60);
    this.attachAuthCookie(res, AUTH_COOKIE_NAMES.refreshToken, session.refreshToken, 14 * 24 * 60 * 60);
    this.attachCsrfCookie(res, session.csrfToken);
  }

  private clearSessionCookies(res: any) {
    res.setHeader("Set-Cookie", [
      serializeCookie(AUTH_COOKIE_NAMES.accessToken, "", this.cookieBaseOptions(0)),
      serializeCookie(AUTH_COOKIE_NAMES.refreshToken, "", this.cookieBaseOptions(0)),
      serializeCookie(AUTH_COOKIE_NAMES.csrfToken, "", {
        ...this.cookieBaseOptions(0),
        httpOnly: false
      })
    ]);
  }

  private attachAuthCookie(res: any, name: string, value: string, maxAgeSeconds: number) {
    const cookies = this.getExistingSetCookies(res);
    cookies.push(serializeCookie(name, value, this.cookieBaseOptions(maxAgeSeconds)));
    res.setHeader("Set-Cookie", cookies);
  }

  private attachCsrfCookie(res: any, csrfToken: string) {
    const cookies = this.getExistingSetCookies(res);
    cookies.push(
      serializeCookie(AUTH_COOKIE_NAMES.csrfToken, csrfToken, {
        ...this.cookieBaseOptions(15 * 60),
        httpOnly: false
      })
    );
    res.setHeader("Set-Cookie", cookies);
  }

  private getExistingSetCookies(res: any): string[] {
    const current = res.getHeader?.("Set-Cookie");
    if (Array.isArray(current)) {
      return [...current];
    }

    if (typeof current === "string" && current.length > 0) {
      return [current];
    }

    return [];
  }

  private cookieBaseOptions(maxAgeSeconds: number) {
    const secure = parseBooleanEnv(process.env["COOKIE_SECURE"], false);
    const sameSite = (process.env["COOKIE_SAMESITE"] as "Lax" | "Strict" | "None" | undefined) ?? DEFAULT_COOKIE_SAMESITE;
    const domain = process.env["COOKIE_DOMAIN"]?.trim();
    const options = {
      httpOnly: true,
      secure,
      sameSite,
      path: "/",
      maxAge: maxAgeSeconds
    };

    if (domain) {
      return {
        ...options,
        domain
      };
    }

    return options;
  }
}
