import { Controller, Get, HttpStatus, Query, Post, Body, UseGuards, Req, Param, Put, Delete, ParseIntPipe, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiExtraModels, ApiBody } from '@nestjs/swagger';
import { FieldManagementService } from './field-management.service';
import { BaseSerializer } from 'src/app.serializer';
import { ApiResponseMessages } from 'src/common/api-response-messages';
import { ListFieldFilterQueryDto } from './dto/list-field-query.dto';
import { FieldInfoDto } from './dto/field-info.dto';
import { FieldScheduleDto, UpdateFieldScheduleDto } from './dto/field-schedule.dto';
import { CreateFieldReviewDto, RespondToReviewDto } from './dto/field-review.dto';
import { UpdateFieldPricingDto } from './dto/field-pricing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { StaffPermissionsGuard } from '../auth/guards/staff-permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { UserRole } from '../db-modules/users.entity';
import { SportType } from '../db-modules/fields.entity';

@ApiTags('fields')
@Controller('field')
@UseGuards(JwtAuthGuard, RolesGuard, StaffPermissionsGuard)
@ApiExtraModels(BaseSerializer, FieldInfoDto, FieldScheduleDto, UpdateFieldScheduleDto, CreateFieldReviewDto)
export class FieldManagementController {
    constructor(private readonly fieldManagementService: FieldManagementService) {}

    @Get('list')
    @ApiOperation({ 
        summary: 'List all fields [GET /api/v1/field/list]', 
        description: 'Get a list of fields with optional filtering including availability, pricing, and facilities' 
    })
    @ApiQuery({ name: 'name', required: false, description: 'Filter by field name' })
    @ApiQuery({ name: 'city', required: false, description: 'Filter by city' })
    @ApiQuery({ name: 'sportType', required: false, enum: SportType, description: 'Filter by sport type' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
    @ApiResponse({ 
        status: 200, 
        description: 'List of fields retrieved successfully',
        schema: {
            allOf: [
                { $ref: '#/components/schemas/BaseSerializer' },
                {
                    properties: {
                        data: {
                            type: 'object',
                            properties: {
                                items: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'number', example: 1 },
                                            name: { type: 'string', example: 'Main Soccer Field' },
                                            description: { type: 'string', example: 'Professional grade soccer field with natural grass' },
                                            sportType: { type: 'string', enum: Object.values(SportType), example: 'soccer' },
                                            location: {
                                                type: 'object',
                                                properties: {
                                                    address: { type: 'string', example: '123 Sports Ave' },
                                                    city: { type: 'string', example: 'New York' },
                                                    coordinates: {
                                                        type: 'object',
                                                        properties: {
                                                            latitude: { type: 'number', example: 40.7128 },
                                                            longitude: { type: 'number', example: -74.0060 }
                                                        }
                                                    }
                                                }
                                            },
                                            pricing: {
                                                type: 'array',
                                                items: {
                                                    type: 'object',
                                                    properties: {
                                                        durationInMinutes: { type: 'number', example: 60 },
                                                        price: { type: 'number', example: 50.00 }
                                                    }
                                                }
                                            },
                                            facilities: {
                                                type: 'array',
                                                items: { type: 'string' },
                                                example: ['Changing Rooms', 'Floodlights', 'Parking']
                                            },
                                            rating: { type: 'number', example: 4.5 },
                                            reviewCount: { type: 'number', example: 25 },
                                            images: {
                                                type: 'array',
                                                items: { type: 'string' }
                                            }
                                        }
                                    }
                                },
                                total: { type: 'number', example: 50 },
                                page: { type: 'number', example: 1 },
                                pages: { type: 'number', example: 5 }
                            }
                        }
                    }
                }
            ]
        }
    })
    async listFieldsController(@Query() query: ListFieldFilterQueryDto): Promise<BaseSerializer> {
        const { data, error } = await this.fieldManagementService.listFieldsService(query);
        if (error) {
            return new BaseSerializer(
                HttpStatus.NOT_FOUND,
                false,
                error,
                data,
                [error]
            );
        }
        return new BaseSerializer(
            HttpStatus.OK,
            true,
            ApiResponseMessages.SUCCESS,
            data,
            error
        );
    }

    @Post('create')
    @Roles(UserRole.COMPANY, UserRole.FACILITY_MANAGER)
    @RequirePermissions('canModifyFacilities')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ 
        summary: 'Create a new field [POST /api/v1/field/create]', 
        description: 'Create a new field with detailed information including facilities, pricing, and schedules' 
    })
    @ApiBody({
        type: FieldInfoDto,
        description: 'Field information including basic details, facilities, and initial pricing',
        required: true
    })
    @ApiResponse({ 
        status: 201, 
        description: 'Field created successfully',
        schema: {
            allOf: [
                { $ref: '#/components/schemas/BaseSerializer' },
                {
                    properties: {
                        data: {
                            type: 'object',
                            properties: {
                                id: { type: 'number', example: 1 },
                                name: { type: 'string' },
                                description: { type: 'string' },
                                sportType: { type: 'string', enum: Object.values(SportType) },
                                location: {
                                    type: 'object',
                                    properties: {
                                        address: { type: 'string' },
                                        city: { type: 'string' },
                                        coordinates: {
                                            type: 'object',
                                            properties: {
                                                latitude: { type: 'number' },
                                                longitude: { type: 'number' }
                                            }
                                        }
                                    }
                                },
                                facilities: {
                                    type: 'array',
                                    items: { type: 'string' }
                                },
                                pricing: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            durationInMinutes: { type: 'number' },
                                            price: { type: 'number' }
                                        }
                                    }
                                },
                                status: { type: 'number', example: 1 },
                                createdBy: { type: 'number' },
                                createdAt: { type: 'string', format: 'date-time' }
                            }
                        }
                    }
                }
            ]
        }
    })
    async createField(@Body() fieldInfo: FieldInfoDto, @Req() req): Promise<BaseSerializer> {
        const { data, error } = await this.fieldManagementService.addFieldsService(fieldInfo);
        if (error) {
            return new BaseSerializer(
                HttpStatus.BAD_REQUEST,
                false,
                error,
                data,
                [error]
            );
        }
        return new BaseSerializer(
            HttpStatus.CREATED,
            true,
            ApiResponseMessages.SUCCESS,
            data,
            error
        );
    }

    @Post(':fieldId/schedules')
    @Roles(UserRole.COMPANY, UserRole.FACILITY_MANAGER, UserRole.MAINTENANCE_STAFF)
    @RequirePermissions('canUpdateSchedules')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ 
        summary: 'Add field schedule [POST /api/v1/field/{fieldId}/schedules]', 
        description: 'Add a new schedule slot for a field' 
    })
    @ApiParam({ name: 'fieldId', type: 'number', description: 'ID of the field' })
    @ApiResponse({ status: 201, description: 'Schedule created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async addFieldSchedule(
        @Param('fieldId', ParseIntPipe) fieldId: number,
        @Body() scheduleDto: FieldScheduleDto,
        @Req() req,
    ): Promise<BaseSerializer> {
        const { data, error } = await this.fieldManagementService.addFieldSchedule(
            fieldId,
            scheduleDto,
            req.user.id,
        );
        if (error) {
            return new BaseSerializer(
                HttpStatus.BAD_REQUEST,
                false,
                error,
                data,
                [error]
            );
        }
        return new BaseSerializer(
            HttpStatus.CREATED,
            true,
            ApiResponseMessages.SUCCESS,
            data,
            error
        );
    }

    @Put(':fieldId/schedules')
    @Roles(UserRole.COMPANY, UserRole.FACILITY_MANAGER, UserRole.MAINTENANCE_STAFF)
    @RequirePermissions('canUpdateSchedules')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ 
        summary: 'Update field schedule [PUT /api/v1/field/{fieldId}/schedules]', 
        description: 'Update an existing schedule for a field' 
    })
    async updateFieldSchedule(
        @Param('fieldId', ParseIntPipe) fieldId: number,
        @Body() updateDto: UpdateFieldScheduleDto,
        @Req() req,
    ): Promise<BaseSerializer> {
        const { data, error } = await this.fieldManagementService.updateFieldSchedule(
            fieldId,
            updateDto,
            req.user.id,
        );
        if (error) {
            return new BaseSerializer(
                HttpStatus.BAD_REQUEST,
                false,
                error,
                data,
                [error]
            );
        }
        return new BaseSerializer(
            HttpStatus.OK,
            true,
            ApiResponseMessages.SUCCESS,
            data,
            error
        );
    }

    @Get(':fieldId/schedules')
    @ApiOperation({ 
        summary: 'Get field schedules [GET /api/v1/field/{fieldId}/schedules]', 
        description: 'Retrieve all schedules for a specific field including regular hours, special hours, and blocked periods' 
    })
    @ApiParam({ 
        name: 'fieldId', 
        type: 'number', 
        description: 'ID of the field to get schedules for' 
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Field schedules retrieved successfully',
        schema: {
            allOf: [
                { $ref: '#/components/schemas/BaseSerializer' },
                {
                    properties: {
                        data: {
                            type: 'object',
                            properties: {
                                regularHours: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'number', example: 1 },
                                            dayOfWeek: { type: 'number', example: 1, description: '1 = Monday, 7 = Sunday' },
                                            openTime: { type: 'string', example: '09:00:00' },
                                            closeTime: { type: 'string', example: '22:00:00' },
                                            isAvailable: { type: 'boolean', example: true }
                                        }
                                    }
                                },
                                specialHours: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'number' },
                                            date: { type: 'string', format: 'date' },
                                            openTime: { type: 'string' },
                                            closeTime: { type: 'string' },
                                            reason: { type: 'string', nullable: true }
                                        }
                                    }
                                },
                                blockedPeriods: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'number' },
                                            startTime: { type: 'string', format: 'date-time' },
                                            endTime: { type: 'string', format: 'date-time' },
                                            reason: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            ]
        }
    })
    async getFieldSchedules(
        @Param('fieldId', ParseIntPipe) fieldId: number,
    ): Promise<BaseSerializer> {
        const { data, error } = await this.fieldManagementService.getFieldSchedules(fieldId);
        if (error) {
            return new BaseSerializer(
                HttpStatus.BAD_REQUEST,
                false,
                error,
                data,
                [error]
            );
        }
        return new BaseSerializer(
            HttpStatus.OK,
            true,
            ApiResponseMessages.SUCCESS,
            data,
            error
        );
    }

    @Delete(':fieldId/schedules/:scheduleId')
    @Roles(UserRole.COMPANY, UserRole.FACILITY_MANAGER)
    @RequirePermissions('canUpdateSchedules')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ 
        summary: 'Delete field schedule [DELETE /api/v1/field/{fieldId}/schedules/{scheduleId}]', 
        description: 'Remove a schedule from a field' 
    })
    async deleteFieldSchedule(
        @Param('fieldId', ParseIntPipe) fieldId: number,
        @Param('scheduleId', ParseIntPipe) scheduleId: number,
        @Req() req,
    ): Promise<BaseSerializer> {
        const { data, error } = await this.fieldManagementService.deleteFieldSchedule(
            fieldId,
            scheduleId,
            req.user.id,
        );
        if (error) {
            return new BaseSerializer(
                HttpStatus.BAD_REQUEST,
                false,
                error,
                data,
                [error]
            );
        }
        return new BaseSerializer(
            HttpStatus.OK,
            true,
            ApiResponseMessages.SUCCESS,
            data,
            error
        );
    }

    @Get(':fieldId/availability')
    @ApiOperation({ 
        summary: 'Check field availability [GET /api/v1/field/{fieldId}/availability]', 
        description: 'Check if a field is available at a specific date and time' 
    })
    @ApiParam({ name: 'fieldId', type: 'number', description: 'ID of the field' })
    @ApiQuery({ 
        name: 'date', 
        required: true, 
        type: String, 
        description: 'Date to check availability (ISO format)',
        example: '2025-04-12T14:00:00Z'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Availability checked successfully',
        schema: {
            example: {
                available: true,
                reason: null,
                schedule: {
                    id: 1,
                    openTime: '09:00:00',
                    closeTime: '22:00:00',
                    isAvailable: true
                },
                specialPrice: null
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Invalid date format' })
    async checkFieldAvailability(
        @Param('fieldId', ParseIntPipe) fieldId: number,
        @Query('date') dateStr: string,
    ): Promise<BaseSerializer> {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
            return new BaseSerializer(
                HttpStatus.BAD_REQUEST,
                false,
                'Invalid date format',
                null,
                ['Invalid date format']
            );
        }

        const result = await this.fieldManagementService.checkFieldAvailability(fieldId, date);
        return new BaseSerializer(
            HttpStatus.OK,
            true,
            ApiResponseMessages.SUCCESS,
            result,
            null
        );
    }

    @Post(':fieldId/reviews')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ 
        summary: 'Create field review [POST /api/v1/field/{fieldId}/reviews]', 
        description: 'Submit a review for a field after booking' 
    })
    @ApiParam({ name: 'fieldId', type: 'number', description: 'ID of the field' })
    @ApiResponse({ status: 201, description: 'Review created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid input or duplicate review' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async createReview(
        @Param('fieldId', ParseIntPipe) fieldId: number,
        @Body() reviewDto: CreateFieldReviewDto,
        @Req() req,
    ): Promise<BaseSerializer> {
        const { data, error } = await this.fieldManagementService.createFieldReview(
            fieldId,
            req.user.id,
            reviewDto,
        );

        if (error) {
            return new BaseSerializer(
                HttpStatus.BAD_REQUEST,
                false,
                error,
                null,
                [error]
            );
        }

        return new BaseSerializer(
            HttpStatus.CREATED,
            true,
            'Review created successfully',
            data,
            null
        );
    }

    @Put('reviews/:reviewId/respond')
    @Roles(UserRole.COMPANY, UserRole.CUSTOMER_SERVICE)
    @RequirePermissions('canRespondToReviews')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ 
        summary: 'Respond to review [PUT /api/v1/field/reviews/{reviewId}/respond]', 
        description: 'Add a response to a field review' 
    })
    async respondToReview(
        @Param('reviewId', ParseIntPipe) reviewId: number,
        @Body() responseDto: RespondToReviewDto,
        @Req() req,
    ): Promise<BaseSerializer> {
        const { data, error } = await this.fieldManagementService.respondToReview(
            reviewId,
            req.user.id,
            responseDto,
        );

        if (error) {
            return new BaseSerializer(
                HttpStatus.BAD_REQUEST,
                false,
                error,
                null,
                [error]
            );
        }

        return new BaseSerializer(
            HttpStatus.OK,
            true,
            'Response added successfully',
            data,
            null
        );
    }

    @Get(':fieldId/reviews')
    @ApiOperation({ 
        summary: 'Get field reviews [GET /api/v1/field/{fieldId}/reviews]', 
        description: 'Retrieve paginated reviews for a specific field including ratings, comments, and responses' 
    })
    @ApiParam({ name: 'fieldId', type: 'number', description: 'ID of the field' })
    @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 10 })
    @ApiQuery({ 
        name: 'rating', 
        required: false, 
        type: Number, 
        description: 'Filter by rating (1-5)',
        minimum: 1,
        maximum: 5
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Reviews retrieved successfully',
        schema: {
            allOf: [
                { $ref: '#/components/schemas/BaseSerializer' },
                {
                    properties: {
                        data: {
                            type: 'object',
                            properties: {
                                items: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'number', example: 1 },
                                            rating: { type: 'number', example: 5 },
                                            review: { type: 'string', example: 'Excellent field with great facilities!' },
                                            user: {
                                                type: 'object',
                                                properties: {
                                                    id: { type: 'number' },
                                                    name: { type: 'string' },
                                                    avatar: { type: 'string', nullable: true }
                                                }
                                            },
                                            images: {
                                                type: 'array',
                                                items: { type: 'string' }
                                            },
                                            response: {
                                                type: 'object',
                                                nullable: true,
                                                properties: {
                                                    text: { type: 'string' },
                                                    respondedAt: { type: 'string', format: 'date-time' },
                                                    respondedBy: {
                                                        type: 'object',
                                                        properties: {
                                                            id: { type: 'number' },
                                                            name: { type: 'string' },
                                                            role: { type: 'string' }
                                                        }
                                                    }
                                                }
                                            },
                                            createdAt: { type: 'string', format: 'date-time' }
                                        }
                                    }
                                },
                                summary: {
                                    type: 'object',
                                    properties: {
                                        averageRating: { type: 'number', example: 4.5 },
                                        totalReviews: { type: 'number', example: 25 },
                                        ratingDistribution: {
                                            type: 'object',
                                            properties: {
                                                '5': { type: 'number', example: 15 },
                                                '4': { type: 'number', example: 5 },
                                                '3': { type: 'number', example: 3 },
                                                '2': { type: 'number', example: 1 },
                                                '1': { type: 'number', example: 1 }
                                            }
                                        }
                                    }
                                },
                                pagination: {
                                    type: 'object',
                                    properties: {
                                        total: { type: 'number', example: 25 },
                                        page: { type: 'number', example: 1 },
                                        pages: { type: 'number', example: 3 }
                                    }
                                }
                            }
                        }
                    }
                }
            ]
        }
    })
    async getFieldReviews(
        @Param('fieldId', ParseIntPipe) fieldId: number,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
    ): Promise<BaseSerializer> {
        const { data, error } = await this.fieldManagementService.getFieldReviews(
            fieldId,
            page,
            limit,
        );

        if (error) {
            return new BaseSerializer(
                HttpStatus.BAD_REQUEST,
                false,
                error,
                null,
                [error]
            );
        }

        return new BaseSerializer(
            HttpStatus.OK,
            true,
            'Reviews retrieved successfully',
            data,
            null
        );
    }

    @Post(':fieldId/pricing')
    @Roles(UserRole.COMPANY, UserRole.FACILITY_MANAGER)
    @RequirePermissions('canUpdatePricing')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ 
        summary: 'Update field pricing [POST /api/v1/field/{fieldId}/pricing]', 
        description: 'Set or update pricing configurations for different durations for a field' 
    })
    @ApiParam({ 
        name: 'fieldId', 
        type: 'number', 
        description: 'ID of the field to update pricing for' 
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Pricing updated successfully',
        schema: {
            example: {
                message: 'Field pricing updated successfully'
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid token' })
    @ApiResponse({ status: 403, description: 'Forbidden - User does not have required role' })
    @ApiResponse({ status: 404, description: 'Field not found' })
    async updateFieldPricing(
        @Param('fieldId') fieldId: number,
        @Body() fieldInfo: UpdateFieldPricingDto,
        @Request() req,
    ) {
        await this.fieldManagementService.updateFieldPricing(
            fieldId,
            fieldInfo.pricing,
            req.user.id,
        );
        return { message: 'Field pricing updated successfully' };
    }

    @Get(':fieldId/pricing')
    @ApiOperation({ 
        summary: 'Get field pricing [GET /api/v1/field/{fieldId}/pricing]', 
        description: 'Retrieve all pricing configurations for a field' 
    })
    @ApiParam({ 
        name: 'fieldId', 
        type: 'number', 
        description: 'ID of the field to get pricing for' 
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Field pricing retrieved successfully',
        schema: {
            example: {
                pricing: [
                    {
                        id: 1,
                        price: 50.00,
                        durationInMinutes: 60,
                        status: 1,
                        createdAt: '2025-04-12T10:00:00Z',
                        updatedAt: '2025-04-12T10:00:00Z'
                    }
                ]
            }
        }
    })
    @ApiResponse({ status: 404, description: 'Field not found' })
    async getFieldPricing(
        @Param('fieldId', ParseIntPipe) fieldId: number
    ) {
        const field = await this.fieldManagementService.getFieldDetails(fieldId);
        return { pricing: field.pricing };
    }
}
