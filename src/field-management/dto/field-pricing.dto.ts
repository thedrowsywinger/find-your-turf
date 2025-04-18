import { IsNumber, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FieldPricingDto {
  @ApiProperty({
    description: 'Price for the field booking',
    example: 50.00,
    minimum: 0,
    type: Number
  })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({
    description: 'Duration of the booking slot in minutes',
    example: 60,
    minimum: 30,
    type: Number
  })
  @IsNumber()
  @Min(30) // Minimum duration of 30 minutes
  durationInMinutes: number;
}

export class UpdateFieldPricingDto {
  @ApiProperty({
    description: 'Array of pricing configurations',
    type: [FieldPricingDto],
    example: [
      { price: 50.00, durationInMinutes: 60 },
      { price: 70.00, durationInMinutes: 90 },
      { price: 90.00, durationInMinutes: 120 }
    ]
  })
  pricing: FieldPricingDto[];
}