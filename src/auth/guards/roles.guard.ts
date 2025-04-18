import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../db-modules/users.entity';
import { JwtStrategy } from '../strategies/jwt.strategy';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    console.log("🚀 ~ roles.guard.ts:14 ~ RolesGuard ~ canActivate ~ requiredRoles:", requiredRoles);

    if (!requiredRoles) {
      return true;
    }
    
    // const { user } = context.switchToHttp().getRequest();
    const request = context.switchToHttp().getRequest();
    console.log("🚀 ~ roles.guard.ts:21 ~ RolesGuard ~ canActivate ~ user:", request.headers.cookie.split('refreshToken=')[1]);
    // identify user from the request refreshToken
    const refreshToken = request.headers.cookie.split('refreshToken=')[1];
    console.log("🚀 ~ roles.guard.ts:16 ~ RolesGuard ~ canActivate ~ requiredRoles:", requiredRoles);
    return requiredRoles.includes(request.user.role);
  }
}