import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AUTH_COOKIE_NAMES } from "./auth.constants";
import { AuthService } from "./auth.service";
import type { AuthRole } from "./auth.types";
import { ROLES_KEY } from "./roles.decorator";
import { parseCookieHeader } from "./auth.utils";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedRoles = this.reflector.getAllAndOverride<AuthRole[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const cookies = parseCookieHeader(request.headers?.cookie);
    const user = this.authService.getUserByRefreshToken(cookies[AUTH_COOKIE_NAMES.refreshToken]);

    if (!user) {
      throw new UnauthorizedException("Authentication required");
    }

    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException("Insufficient role for this route");
    }

    request.user = user;
    return true;
  }
}
