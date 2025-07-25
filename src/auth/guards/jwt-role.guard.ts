// src/auth/guards/jwt-role.guard.ts

import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  mixin,
  Type,
  CanActivate,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '../../db-modules/users.entity';

export function JwtRolesGuard(...requiredRoles: UserRole[]): Type<CanActivate> {
  @Injectable()
  class MixinJwtRolesGuard extends AuthGuard('jwt') {
    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
      if (err || !user) {
        throw err || new UnauthorizedException();
      }

      // if the user’s role is not in our allowed list, reject
      if (!requiredRoles.includes(user.role)) {
        throw new UnauthorizedException(
          `Only users with roles [${requiredRoles}] are allowed to access this resource. You are currently an [${user.role}]`,
          'Unauthorized',
        );
      }

      const req = context.switchToHttp().getRequest();
      req.user = user;
      req.headers['x-user-id']    = user.id?.toString();
      req.headers['x-user-role']  = user.role;
      req.headers['x-user-email'] = user.email;
      delete user.password;
      delete user.refreshToken;

      return user;
    }
  }

  return mixin(MixinJwtRolesGuard);
}
