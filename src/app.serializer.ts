import { ApiProperty } from '@nestjs/swagger';

export class BaseSerializer {
    @ApiProperty({
        description: 'HTTP status code',
        example: 200,
        type: Number
    })
    statusCode: number;

    @ApiProperty({
        description: 'Whether the request was successful',
        example: true,
        type: Boolean
    })
    success: boolean;

    @ApiProperty({
        description: 'Response message',
        example: 'Operation completed successfully',
        type: String
    })
    message: string;

    @ApiProperty({
        description: 'Response data payload',
        example: null,
        nullable: true,
        type: Object
    })
    data: any;

    @ApiProperty({
        description: 'Array of error messages if any',
        example: null,
        nullable: true,
        type: Array
    })
    errors: any;
  
    constructor(statusCode: number, success: boolean, message: string, data: any, errors: any) {
        this.statusCode = statusCode;
        this.success = success;
        this.message = message;
        this.data = data;
        this.errors = errors;
    }
}