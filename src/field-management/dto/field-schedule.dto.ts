import { IsEnum, IsString, IsOptional, IsBoolean, IsNumber, ValidateNested, IsArray, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DayOfWeek, RecurrenceType } from '../../db-modules/field-schedules.entity';

export class ZoneConfigDto {
  @ApiPropertyOptional({
    description: 'Maximum capacity for this zone',
    example: 20
  })
  @IsOptional()
  @IsNumber()
  capacity?: number;

  @ApiPropertyOptional({
    description: 'Description of the zone',
    example: 'North half of the field with premium turf'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Available amenities in this zone',
    example: ['Floodlights', 'Benches', 'Water Station']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];
}

export class TimeBlockDto {
  @ApiProperty({
    description: 'Start time of the block (HH:mm:ss)',
    example: '09:00:00'
  })
  @IsString()
  startTime: string;

  @ApiProperty({
    description: 'End time of the block (HH:mm:ss)',
    example: '10:30:00'
  })
  @IsString()
  endTime: string;

  @ApiPropertyOptional({
    description: 'Maximum capacity for this time block',
    example: 15
  })
  @IsOptional()
  @IsNumber()
  capacity?: number;

  @ApiPropertyOptional({
    description: 'Special price for this time block',
    example: 75.00
  })
  @IsOptional()
  @IsNumber()
  price?: number;
}

export class RecurrenceConfigDto {
  @ApiPropertyOptional({
    description: 'Interval for recurring schedules (e.g., every 2 weeks)',
    example: 2
  })
  @IsOptional()
  @IsNumber()
  interval?: number;

  @ApiPropertyOptional({
    description: 'Days of week for recurring schedules',
    isArray: true,
    enum: DayOfWeek,
    example: [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY, DayOfWeek.FRIDAY]
  })
  @IsOptional()
  @IsEnum(DayOfWeek, { each: true })
  daysOfWeek?: DayOfWeek[];

  @ApiPropertyOptional({
    description: 'Days of month for monthly recurrence',
    example: [1, 15, 28]
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  monthlyDays?: number[];

  @ApiPropertyOptional({
    description: 'End date for the recurring schedule',
    example: '2025-12-31'
  })
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @ApiPropertyOptional({
    description: 'Exception dates where schedule does not apply',
    isArray: true,
    example: ['2025-12-25', '2026-01-01']
  })
  @IsOptional()
  @IsDateString({}, { each: true })
  exceptions?: Date[];
}

export class FieldScheduleDto {
  @ApiProperty({
    enum: DayOfWeek,
    description: 'Day of week for the schedule',
    example: DayOfWeek.MONDAY
  })
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @ApiProperty({
    description: 'Opening time (HH:mm:ss)',
    example: '09:00:00'
  })
  @IsString()
  openTime: string;

  @ApiProperty({
    description: 'Closing time (HH:mm:ss)',
    example: '22:00:00'
  })
  @IsString()
  closeTime: string;

  @ApiProperty({
    description: 'Whether this schedule is currently active',
    example: true
  })
  @IsBoolean()
  isAvailable: boolean;

  @ApiPropertyOptional({
    description: 'Special price for this schedule',
    example: 100.00
  })
  @IsOptional()
  @IsNumber()
  specialPrice?: number;

  @ApiPropertyOptional({
    description: 'Name of the zone (if field is divided)',
    example: 'North Field'
  })
  @IsOptional()
  @IsString()
  zoneName?: string;

  @ApiPropertyOptional({
    description: 'Zone-specific configuration'
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ZoneConfigDto)
  zoneConfig?: ZoneConfigDto;

  @ApiProperty({
    enum: RecurrenceType,
    description: 'Type of recurrence for this schedule',
    example: RecurrenceType.WEEKLY,
    default: RecurrenceType.WEEKLY
  })
  @IsEnum(RecurrenceType)
  recurrenceType: RecurrenceType;

  @ApiPropertyOptional({
    description: 'Configuration for recurring schedules'
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => RecurrenceConfigDto)
  recurrenceConfig?: RecurrenceConfigDto;

  @ApiPropertyOptional({
    description: 'Time blocks within the schedule period',
    type: [TimeBlockDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeBlockDto)
  timeBlocks?: TimeBlockDto[];
}

export class UpdateFieldScheduleDto extends FieldScheduleDto {
  @ApiProperty({
    description: 'ID of the schedule to update',
    example: 1
  })
  @IsNumber()
  scheduleId: number;
}