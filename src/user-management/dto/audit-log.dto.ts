import { IsEnum, IsOptional, IsNumber, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AuditActionType } from '../../db-modules/audit-logs.entity';

export class AuditLogQueryDto {
  @ApiPropertyOptional({
    description: 'Filter logs by user ID',
    example: 1,
    type: Number
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  userId?: number;

  @ApiPropertyOptional({
    description: 'Filter logs by field ID',
    example: 5,
    type: Number
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  fieldId?: number;

  @ApiPropertyOptional({
    description: 'Filter logs by action type',
    enum: AuditActionType,
    example: AuditActionType.STAFF_ADDED
  })
  @IsOptional()
  @IsEnum(AuditActionType)
  action?: AuditActionType;

  @ApiPropertyOptional({
    description: 'Start date for log filtering (ISO format)',
    example: '2025-01-01T00:00:00Z',
    type: String
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for log filtering (ISO format)',
    example: '2025-12-31T23:59:59Z',
    type: String
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
    type: Number
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page for pagination',
    example: 10,
    default: 10,
    type: Number
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;
} 