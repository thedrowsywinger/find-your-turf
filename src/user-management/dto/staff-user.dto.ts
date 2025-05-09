import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { UserRole } from '../../db-modules/users.entity';

export class StaffPermissionsDto {
  @ApiPropertyOptional({
    description: 'Permission to manage staff accounts',
    example: true,
    type: Boolean
  })
  @IsOptional()
  @IsBoolean()
  canManageStaff?: boolean;

  @ApiPropertyOptional({
    description: 'Permission to manage bookings',
    example: true,
    type: Boolean
  })
  @IsOptional()
  @IsBoolean()
  canManageBookings?: boolean;

  @ApiPropertyOptional({
    description: 'Permission to update field schedules',
    example: true,
    type: Boolean
  })
  @IsOptional()
  @IsBoolean()
  canUpdateSchedules?: boolean;

  @ApiPropertyOptional({
    description: 'Permission to respond to customer reviews',
    example: true,
    type: Boolean
  })
  @IsOptional()
  @IsBoolean()
  canRespondToReviews?: boolean;

  @ApiPropertyOptional({
    description: 'Permission to access reports',
    example: true,
    type: Boolean
  })
  @IsOptional()
  @IsBoolean()
  canAccessReports?: boolean;

  @ApiPropertyOptional({
    description: 'Permission to update field pricing',
    example: true,
    type: Boolean
  })
  @IsOptional()
  @IsBoolean()
  canUpdatePricing?: boolean;

  @ApiPropertyOptional({
    description: 'Permission to modify facilities',
    example: true,
    type: Boolean
  })
  @IsOptional()
  @IsBoolean()
  canModifyFacilities?: boolean;
}

export class CreateStaffUserDto {
  @ApiProperty({
    description: 'Username for the staff member',
    example: 'facility_manager1',
    type: String
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Email address for the staff member',
    example: 'manager@example.com',
    type: String
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Password for the staff account',
    example: 'SecurePassword123',
    type: String
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'Role of the staff member',
    enum: [UserRole.FACILITY_MANAGER, UserRole.MAINTENANCE_STAFF, UserRole.CUSTOMER_SERVICE],
    example: UserRole.FACILITY_MANAGER,
    type: String
  })
  @IsEnum([UserRole.FACILITY_MANAGER, UserRole.MAINTENANCE_STAFF, UserRole.CUSTOMER_SERVICE])
  @IsNotEmpty()
  role: UserRole;

  @ApiProperty({
    description: 'Custom permissions for the staff member',
    type: StaffPermissionsDto
  })
  @ValidateNested()
  @Type(() => StaffPermissionsDto)
  @IsOptional()
  permissions?: StaffPermissionsDto;
}

export class UpdateStaffUserDto {
  @ApiPropertyOptional({
    description: 'Updated username for the staff member',
    example: 'facility_manager_lead',
    type: String
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({
    description: 'Updated email address for the staff member',
    example: 'lead_manager@example.com',
    type: String
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Updated password for the staff account',
    example: 'NewSecurePassword123',
    type: String
  })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({
    description: 'Updated role of the staff member',
    enum: [UserRole.FACILITY_MANAGER, UserRole.MAINTENANCE_STAFF, UserRole.CUSTOMER_SERVICE],
    example: UserRole.FACILITY_MANAGER,
    type: String
  })
  @IsEnum([UserRole.FACILITY_MANAGER, UserRole.MAINTENANCE_STAFF, UserRole.CUSTOMER_SERVICE])
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Updated permissions for the staff member',
    type: StaffPermissionsDto
  })
  @ValidateNested()
  @Type(() => StaffPermissionsDto)
  @IsOptional()
  permissions?: StaffPermissionsDto;

  @ApiPropertyOptional({
    description: 'Status of the user account (1: active, 0: inactive)',
    example: 1,
    type: Number
  })
  @IsOptional()
  status?: number;
} 