import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ADMIN_USER_ROLES_KEY } from '../decorators/roles.decorator';
import { AuthenticatedRequest } from '../types';
import { AdminUserRole } from 'src/shared/enums';

export class AdminRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route is marked as public using @Public() decorator
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If route is public, allow access without checking entitlements
    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<AdminUserRole[]>(
      ADMIN_USER_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userRole = request?.userDetail?.role;
    if (
      !userRole ||
      !requiredRoles.includes(userRole) ||
      !request?.userDetail?.isAdmin
    ) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return true;
  }
}
