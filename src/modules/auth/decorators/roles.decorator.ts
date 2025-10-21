import { applyDecorators, UseGuards } from '@nestjs/common';
import { AdminUserRole } from 'src/shared/enums';
import { SetMetadata } from '@nestjs/common';
import { AdminRolesGuard } from '../guards/roles.guard';

export const ADMIN_USER_ROLES_KEY = 'adminUserRoles';

export function AdminUserRoles(...roles: AdminUserRole[]) {
  return applyDecorators(
    SetMetadata(ADMIN_USER_ROLES_KEY, roles),
    UseGuards(AdminRolesGuard),
  );
}
