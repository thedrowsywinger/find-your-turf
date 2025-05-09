import { SetMetadata } from '@nestjs/common';

/**
 * Decorator for specifying the required permissions to access a resource
 * Use with StaffPermissionsGuard
 * @param permissions - Array of permission keys to check
 * @returns Decorator function
 */
export const RequirePermissions = (...permissions: string[]) => 
  SetMetadata('permissions', permissions);