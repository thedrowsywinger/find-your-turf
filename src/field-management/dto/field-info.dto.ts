import { IsEnum, IsString, IsOptional, ValidateNested, ArrayNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SportType } from '../../db-modules/fields.entity';
import { FieldPricingDto } from './field-pricing.dto';

export class FieldInfoDto {
    @ApiProperty({
        description: 'Name of the field',
        example: 'Central Park Football Ground'
    })
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Physical address of the field',
        example: '123 Sports Avenue'
    })
    @IsString()
    address: string;

    @ApiProperty({
        description: 'City where the field is located',
        example: 'New York'
    })
    @IsString()
    city: string;

    @ApiProperty({
        description: 'Country where the field is located',
        example: 'United States'
    })
    @IsString()
    country: string;

    @ApiProperty({
        description: 'Detailed description of the field',
        example: 'Professional football ground with synthetic turf and flood lights'
    })
    @IsString()
    description: string;

    @ApiProperty({
        description: 'Type of sport the field is designed for',
        enum: SportType,
        example: SportType.FOOTBALL
    })
    @IsEnum(SportType)
    sportType: SportType;

    @ApiProperty({
        description: 'code of the brand/company that owns the field',
        example: ""
    })
    @IsString()
    brandId: string;

    @ApiProperty({
        description: 'Array of pricing configurations for different durations',
        type: [FieldPricingDto],
        required: false,
        example: [
            {
                price: 50.00,
                durationInMinutes: 60
            },
            {
                price: 70.00,
                durationInMinutes: 90
            }
        ]
    })
    @IsOptional()
    @ValidateNested({ each: true })
    @ArrayNotEmpty()
    @Type(() => FieldPricingDto)
    pricing: FieldPricingDto[];
}