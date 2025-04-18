import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DayOfWeek } from '../../db-modules/field-schedules.entity';

export class ListFieldFilterQueryDto {
    @ApiPropertyOptional({
        description: 'Filter fields by name',
        example: 'Central Park'
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({
        description: 'Filter fields by address',
        example: 'Sports Avenue'
    })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional({
        description: 'Filter fields by city',
        example: 'New York'
    })
    @IsOptional()
    @IsString()
    city?: string;

    @ApiPropertyOptional({
        description: 'Filter fields by country',
        example: 'United States'
    })
    @IsOptional()
    @IsString()
    country?: string;

    @ApiPropertyOptional({
        description: 'Filter fields by brand/company ID',
        example: 1,
        type: Number
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    brandId?: number;

    @ApiPropertyOptional({
        description: 'Filter fields available from this date/time (ISO format)',
        example: '2025-04-12T14:00:00Z',
        type: String
    })
    @IsOptional()
    @Transform(({ value }) => new Date(value))
    availableFrom?: Date;

    @ApiPropertyOptional({
        description: 'Filter fields available until this date/time (ISO format)',
        example: '2025-04-12T16:00:00Z',
        type: String
    })
    @IsOptional()
    @Transform(({ value }) => new Date(value))
    availableTo?: Date;

    @ApiPropertyOptional({
        description: 'Filter fields with price greater than or equal to this value',
        example: 50,
        minimum: 0,
        type: Number
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(0)
    minPrice?: number;

    @ApiPropertyOptional({
        description: 'Filter fields with price less than or equal to this value',
        example: 100,
        minimum: 0,
        type: Number
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(0)
    maxPrice?: number;

    @ApiPropertyOptional({
        description: 'Filter fields by sport type',
        example: 'football',
        enum: ['football', 'cricket', 'basketball', 'table_tennis', 'other']
    })
    @IsOptional()
    @IsString()
    sportType?: string;

    @ApiPropertyOptional({
        description: 'Filter fields by day of week availability',
        enum: DayOfWeek,
        example: DayOfWeek.MONDAY
    })
    @IsOptional()
    @IsEnum(DayOfWeek)
    dayOfWeek?: DayOfWeek;

    @ApiPropertyOptional({
        description: 'Filter fields available at this time (HH:mm:ss format)',
        example: '14:00:00'
    })
    @IsOptional()
    @Transform(({ value }) => value.toString())
    timeSlot?: string;

    @ApiPropertyOptional({
        description: 'Filter fields with rating greater than or equal to this value',
        minimum: 1,
        maximum: 5,
        example: 4,
        type: Number
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    @Max(5)
    minRating?: number;

    @ApiPropertyOptional({
        description: 'Filter fields with rating less than or equal to this value',
        minimum: 1,
        maximum: 5,
        example: 5,
        type: Number
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    @Max(5)
    maxRating?: number;

    @ApiPropertyOptional({
        description: 'Filter fields that have reviews',
        example: 'true',
        type: String
    })
    @IsOptional()
    @Transform(({ value }) => value === 'true')
    hasReviews?: string;

    @ApiPropertyOptional({
        description: 'Page number for pagination',
        minimum: 1,
        default: 1,
        type: Number
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Number of items per page',
        minimum: 1,
        default: 10,
        type: Number
    })
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    @IsInt()
    @Min(1)
    limit?: number = 10;
}