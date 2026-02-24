import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, PERMISSIONS_KEY } from '../decorators/auth.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    const { user } = ctx.switchToHttp().getRequest();
    const userRoles: string[] = user?.roles ?? [];
    const userPermissions: string[] = user?.permissions ?? [];

    if (requiredRoles?.length) {
      const hasRole = requiredRoles.some((r) => userRoles.includes(r));
      if (!hasRole) return false;
    }

    if (requiredPermissions?.length) {
      const hasPermission = requiredPermissions.some((p) => userPermissions.includes(p));
      if (!hasPermission) return false;
    }

    return true;
  }
}
