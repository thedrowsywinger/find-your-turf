import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../db-modules/users.entity';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);