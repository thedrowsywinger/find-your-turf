import { Body, Controller, Get, HttpStatus, Param, Post, Put, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody, ApiExtraModels } from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BaseSerializer } from '../app.serializer';
import { ApiResponseMessages } from '../common/api-response-messages';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../db-modules/users.entity';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';

@ApiTags('bookings')
@Controller('booking')
@UseGuards(JwtAuthGuard)
@ApiExtraModels(BaseSerializer, CreateBookingDto)
export class BookingController {
    constructor(private readonly bookingService: BookingService) {}

    @Post('create')
    @ApiBearerAuth('access-token')
    @Roles(UserRole.CONSUMER)
    @ApiOperation({ 
        summary: 'Create booking [POST /api/v1/booking/create]',
        description: 'Create a new field booking for a specific time slot. The field must be available for the requested time slot.' 
    })
    @ApiBody({
        type: CreateBookingDto,
        description: 'Booking details including field ID, time slot, and any special requests',
        required: true
    })
    @ApiResponse({ 
        status: 201, 
        description: 'Booking created successfully',
        schema: {
            allOf: [
                { $ref: '#/components/schemas/BaseSerializer' },
                {
                    properties: {
                        data: {
                            type: 'object',
                            properties: {
                                id: { type: 'number', example: 1 },
                                fieldId: { type: 'number', example: 5 },
                                userId: { type: 'number', example: 10 },
                                startTime: { type: 'string', format: 'date-time', example: '2025-04-18T14:00:00Z' },
                                endTime: { type: 'string', format: 'date-time', example: '2025-04-18T16:00:00Z' },
                                status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled'], example: 'pending' },
                                totalPrice: { type: 'number', example: 100 },
                                notes: { type: 'string', example: 'Need goal posts', nullable: true },
                                createdAt: { type: 'string', format: 'date-time' }
                            }
                        }
                    }
                }
            ]
        }
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Invalid input or field not available',
        schema: {
            allOf: [
                { $ref: '#/components/schemas/BaseSerializer' },
                {
                    properties: {
                        errors: {
                            type: 'array',
                            items: {
                                type: 'string',
                                example: ['Field is not available for the requested time slot']
                            }
                        }
                    }
                }
            ]
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
    @ApiResponse({ status: 403, description: 'Forbidden - User is not a consumer' })
    async createBooking(
        @Body() createBookingDto: CreateBookingDto,
        @Req() req,
    ): Promise<BaseSerializer> {
        const { data, error } = await this.bookingService.createBooking(
            createBookingDto,
            req.user.id,
        );

        if (error) {
            return new BaseSerializer(
                HttpStatus.BAD_REQUEST,
                false,
                error,
                data,
                [error],
            );
        }

        return new BaseSerializer(
            HttpStatus.CREATED,
            true,
            ApiResponseMessages.SUCCESS,
            data,
            null,
        );
    }

    @Get('my-bookings')
    @ApiBearerAuth('access-token')
    @ApiOperation({ 
        summary: 'List user bookings [GET /api/v1/booking/my-bookings]',
        description: 'Get a list of all bookings for the authenticated user including past, current, and upcoming bookings' 
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Bookings retrieved successfully',
        schema: {
            allOf: [
                { $ref: '#/components/schemas/BaseSerializer' },
                {
                    properties: {
                        data: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'number', example: 1 },
                                    field: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'number', example: 5 },
                                            name: { type: 'string', example: 'Main Soccer Field' },
                                            sportType: { type: 'string', example: 'soccer' },
                                            location: { type: 'string', example: 'City Center' }
                                        }
                                    },
                                    startTime: { type: 'string', format: 'date-time', example: '2025-04-18T14:00:00Z' },
                                    endTime: { type: 'string', format: 'date-time', example: '2025-04-18T16:00:00Z' },
                                    status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled'], example: 'confirmed' },
                                    totalPrice: { type: 'number', example: 100 },
                                    notes: { type: 'string', nullable: true },
                                    createdAt: { type: 'string', format: 'date-time' }
                                }
                            }
                        }
                    }
                }
            ]
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
    async getMyBookings(@Req() req): Promise<BaseSerializer> {
        const { data, error } = await this.bookingService.getUserBookings(req.user.id);

        if (error) {
            return new BaseSerializer(
                HttpStatus.BAD_REQUEST,
                false,
                error,
                data,
                [error],
            );
        }

        return new BaseSerializer(
            HttpStatus.OK,
            true,
            ApiResponseMessages.SUCCESS,
            data,
            null,
        );
    }

    @Get(':id')
    @ApiBearerAuth('access-token')
    @ApiOperation({ 
        summary: 'Get booking details [GET /api/v1/booking/{id}]',
        description: 'Get detailed information about a specific booking including field details and payment status'
    })
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'ID of the booking',
        required: true
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Booking details retrieved successfully',
        schema: {
            allOf: [
                { $ref: '#/components/schemas/BaseSerializer' },
                {
                    properties: {
                        data: {
                            type: 'object',
                            properties: {
                                id: { type: 'number', example: 1 },
                                field: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'number' },
                                        name: { type: 'string' },
                                        sportType: { type: 'string' },
                                        location: { type: 'string' },
                                        facilities: { type: 'array', items: { type: 'string' } }
                                    }
                                },
                                startTime: { type: 'string', format: 'date-time' },
                                endTime: { type: 'string', format: 'date-time' },
                                status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled'] },
                                totalPrice: { type: 'number' },
                                payment: {
                                    type: 'object',
                                    properties: {
                                        status: { type: 'string', enum: ['pending', 'completed', 'failed'] },
                                        method: { type: 'string', nullable: true },
                                        paidAt: { type: 'string', format: 'date-time', nullable: true }
                                    }
                                },
                                notes: { type: 'string', nullable: true },
                                createdAt: { type: 'string', format: 'date-time' },
                                updatedAt: { type: 'string', format: 'date-time' }
                            }
                        }
                    }
                }
            ]
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
    @ApiResponse({ status: 403, description: 'Forbidden - User does not own this booking' })
    @ApiResponse({ status: 404, description: 'Booking not found' })
    async getBookingDetails(
        @Param('id') bookingId: number,
        @Req() req,
    ): Promise<BaseSerializer> {
        const { data, error } = await this.bookingService.getBookingDetails(
            bookingId,
            req.user.id,
        );

        if (error) {
            return new BaseSerializer(
                HttpStatus.BAD_REQUEST,
                false,
                error,
                data,
                [error],
            );
        }

        return new BaseSerializer(
            HttpStatus.OK,
            true,
            ApiResponseMessages.SUCCESS,
            data,
            null,
        );
    }

    @Put(':id/cancel')
    @ApiBearerAuth('access-token')
    @ApiOperation({ 
        summary: 'Cancel booking',
        description: 'Cancel an existing booking. Only the booking owner or facility staff can cancel bookings.' 
    })
    @ApiParam({
        name: 'id',
        description: 'ID of the booking to cancel',
        type: 'number',
        required: true
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Booking cancelled successfully',
        schema: {
            allOf: [
                { $ref: '#/components/schemas/BaseSerializer' },
                {
                    properties: {
                        data: {
                            type: 'object',
                            properties: {
                                id: { type: 'number', example: 1 },
                                status: { type: 'string', enum: ['cancelled'], example: 'cancelled' },
                                cancelledAt: { type: 'string', format: 'date-time' },
                                cancelledBy: { type: 'number', example: 10 },
                                refundAmount: { type: 'number', example: 80, nullable: true },
                                cancelReason: { type: 'string', example: 'Weather conditions', nullable: true }
                            }
                        }
                    }
                }
            ]
        }
    })
    @ApiResponse({ status: 400, description: 'Bad request - Cannot cancel booking' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
    @ApiResponse({ status: 403, description: 'Forbidden - User is not authorized to cancel this booking' })
    @ApiResponse({ status: 404, description: 'Booking not found' })
    async cancelBooking(
        @Param('id') bookingId: number,
        @Req() req,
    ): Promise<BaseSerializer> {
        const { data, error } = await this.bookingService.cancelBooking(
            bookingId,
            req.user.id,
        );

        if (error) {
            return new BaseSerializer(
                HttpStatus.BAD_REQUEST,
                false,
                error,
                data,
                [error],
            );
        }

        return new BaseSerializer(
            HttpStatus.OK,
            true,
            ApiResponseMessages.SUCCESS,
            data,
            null,
        );
    }

    @Put(':id/confirm')
    @ApiBearerAuth('access-token')
    @Roles(UserRole.COMPANY, UserRole.FACILITY_MANAGER, UserRole.CUSTOMER_SERVICE)
    @RequirePermissions('canManageBookings')
    @ApiOperation({ 
        summary: 'Confirm booking',
        description: 'Confirm a pending booking. Only facility staff with booking management permissions can confirm bookings.' 
    })
    @ApiParam({
        name: 'id',
        description: 'ID of the booking to confirm',
        type: 'number',
        required: true
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Booking confirmed successfully',
        schema: {
            allOf: [
                { $ref: '#/components/schemas/BaseSerializer' },
                {
                    properties: {
                        data: {
                            type: 'object',
                            properties: {
                                id: { type: 'number', example: 1 },
                                status: { type: 'string', enum: ['confirmed'], example: 'confirmed' },
                                confirmedAt: { type: 'string', format: 'date-time' },
                                confirmedBy: { type: 'number', example: 5 },
                                notes: { type: 'string', example: 'Booking confirmed by facility manager', nullable: true }
                            }
                        }
                    }
                }
            ]
        }
    })
    @ApiResponse({ status: 400, description: 'Bad request - Booking cannot be confirmed' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
    @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
    @ApiResponse({ status: 404, description: 'Booking not found' })
    async confirmBooking(
        @Param('id') bookingId: number,
        @Req() req,
    ): Promise<BaseSerializer> {
        const { data, error } = await this.bookingService.confirmBooking(
            bookingId
        );

        if (error) {
            return new BaseSerializer(
                HttpStatus.BAD_REQUEST,
                false,
                error,
                data,
                [error],
            );
        }

        return new BaseSerializer(
            HttpStatus.OK,
            true,
            ApiResponseMessages.SUCCESS,
            data,
            null,
        );
    }
}