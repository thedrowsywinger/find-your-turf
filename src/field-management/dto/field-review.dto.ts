import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFieldReviewDto {
    @ApiProperty({
        description: 'ID of the booking this review is for',
        example: 1234,
        type: Number
    })
    @IsNumber()
    @IsNotEmpty()
    bookingId: number;

    @ApiProperty({
        description: 'Rating score for the field (1-5 stars)',
        minimum: 1,
        maximum: 5,
        example: 5,
        type: Number
    })
    @IsNumber()
    @Min(1)
    @Max(5)
    @IsNotEmpty()
    rating: number;

    @ApiProperty({
        description: 'Detailed review text',
        example: 'Great field with excellent facilities. The turf was well maintained and the floodlights worked perfectly.',
        type: String
    })
    @IsString()
    @IsNotEmpty()
    review: string;
}

export class RespondToReviewDto {
    @ApiProperty({
        description: 'Company response to the review',
        example: 'Thank you for your feedback! We are glad you enjoyed our facilities.',
        type: String
    })
    @IsString()
    @IsNotEmpty()
    response: string;
}