import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({
    description: 'ID of the field to book',
    example: 1,
    type: Number
  })
  @IsNumber()
  @IsNotEmpty()
  fieldId: number;

  @ApiProperty({
    description: 'Booking start time (ISO format)',
    example: '2025-04-12T14:00:00Z',
    type: String
  })
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({
    description: 'Booking end time (ISO format)',
    example: '2025-04-12T16:00:00Z',
    type: String
  })
  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @ApiPropertyOptional({
    description: 'Additional notes for the booking',
    example: 'Need goal posts and 10 training bibs',
    type: String
  })
  @IsString()
  @IsOptional()
  notes?: string;
}