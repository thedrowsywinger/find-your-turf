import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../db-modules/users.entity';

/**
 * Decorator for defining allowed roles for route access
 * @param roles - Roles that are allowed to access the route
 * @returns Decorator function
 */
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);