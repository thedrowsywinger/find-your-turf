import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../db-modules/users.entity';

@Injectable()
export class StaffPermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler());
    if (!requiredPermissions) {
      return true; // No permissions required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      return false; // No user in request (should be handled by JwtAuthGuard)
    }

    // Admin and Company users bypass permission checks
    if (user.role === UserRole.ADMIN || user.role === UserRole.COMPANY) {
      return true;
    }

    // Staff members need specific permissions
    if (user.permissions) {
      return requiredPermissions.every(permission => user.permissions[permission] === true);
    }

    return false;
  }
}