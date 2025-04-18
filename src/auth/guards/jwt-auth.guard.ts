// src/auth/guards/jwt-auth.guard.ts
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRole } from '../../db-modules/users.entity';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    const request = context.switchToHttp().getRequest();

    // **Manually** attach user to the request
    request.user = user;

    // now you can safely read `request.user` in later guards/controllers
    request.headers['x-user-id']    = user.id?.toString();
    request.headers['x-user-role']  = user.role as UserRole;
    request.headers['x-user-email'] = user.email;

    delete user.password;
    delete user.refreshToken;

    return user;
  }
}
