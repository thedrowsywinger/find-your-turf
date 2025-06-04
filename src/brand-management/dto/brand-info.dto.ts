// src/brand-management/dto/brand-info.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ValidateNested,
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  ArrayMinSize,
} from 'class-validator';
import { FieldInfoDto } from './field-info.dto';

export class CreateBrandDto {
  @ApiProperty({ description: 'Brand name', example: 'Premier Sports Complex' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Brief description of the brand',
    example: 'Premier sports facility offering multiple fields and amenities',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Contact email for the brand', example: 'contact@premiersports.com' })
  @IsEmail()
  contactEmail: string;

  @ApiProperty({ description: 'Contact phone number for the brand', example: '+1234567890' })
  @IsString()
  @IsNotEmpty()
  contactPhone: string;

  @ApiProperty({ description: 'The Full address', example: 'Plot 42, Road 2, Block C, Bashundhara R/A' })
  @IsString()
  @IsNotEmpty()
  fullAddress: string;

  @ApiProperty({ description: 'Street address', example: '123 Sports Avenue' })
  @IsString()
  @IsOptional()
  street: string;

  @ApiProperty({ description: 'City name', example: 'Dhaka' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiPropertyOptional({ description: 'State or region', example: 'Dhaka Division' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ description: 'Postal code', example: '12345' })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiProperty({ description: 'Country', example: 'Bangladesh' })
  @IsString()
  @IsNotEmpty()
  country: string;

  // @ApiProperty({
  //   type: FieldInfoDto,
  //   isArray: true,
  //   description: 'Initial list of fields to create under this brand',
  //   example: [
  //     {
  //       name: 'Main Soccer Field',
  //       sportType: 'soccer',
  //       description: 'Professional grade natural grass field',
  //       facilities: ['Floodlights', 'Changing Rooms', 'Spectator Seating'],
  //     },
  //   ],
  // })
  // @ValidateNested({ each: true })
  // @Type(() => FieldInfoDto)
  // @ArrayMinSize(1)
  // fields: FieldInfoDto[];
}
