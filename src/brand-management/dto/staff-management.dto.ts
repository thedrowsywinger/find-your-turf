import { IsString, IsEmail, IsEnum, IsBoolean, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../db-modules/users.entity';

export class StaffPermissionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  canManageStaff?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  canManageBookings?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  canUpdateSchedules?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  canRespondToReviews?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  canAccessReports?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  canUpdatePricing?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  canModifyFacilities?: boolean;
}

export class CreateStaffDto {
  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty()
  @ValidateNested()
  permissions: StaffPermissionsDto;
}

export class UpdateStaffPermissionsDto {
  @ApiProperty()
  @ValidateNested()
  permissions: StaffPermissionsDto;
}

export class ListStaffQueryDto {
  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}