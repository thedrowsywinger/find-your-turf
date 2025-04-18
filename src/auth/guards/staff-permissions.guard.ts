import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../db-modules/users.entity';

@Injectable()
export class StaffPermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler());
    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Company owners bypass permission checks
    if (user.role === UserRole.COMPANY) {
      return true;
    }

    // Check if user has any staff role
    const isStaffMember = [
      UserRole.FACILITY_MANAGER,
      UserRole.MAINTENANCE_STAFF,
      UserRole.CUSTOMER_SERVICE
    ].includes(user.role);

    if (!isStaffMember || !user.permissions) {
      return false;
    }

    // Check if user has all required permissions
    return requiredPermissions.every(permission => user.permissions[permission] === true);
  }
}