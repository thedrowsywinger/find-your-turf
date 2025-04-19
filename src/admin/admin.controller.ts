import { Controller, Get, Post, Body, Query, Param, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/jwt-brand.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../db-modules/users.entity';
import { BaseSerializer } from '../app.serializer';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiExtraModels } from '@nestjs/swagger';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@Roles(UserRole.ADMIN)
@ApiExtraModels(BaseSerializer)
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @Get('users')
    @ApiBearerAuth('access-token')
    @ApiOperation({ 
        summary: 'List all users [GET /api/v1/admin/users]',
        description: 'Get a list of all users in the system with optional filtering'
    })
    @ApiQuery({ 
        name: 'role', 
        required: false, 
        enum: UserRole,
        description: 'Filter users by role'
    })
    @ApiQuery({ 
        name: 'status', 
        required: false, 
        type: 'number',
        description: 'Filter by user status (1: active, 0: inactive)'
    })
    @ApiQuery({ 
        name: 'page', 
        required: false, 
        type: 'number',
        description: 'Page number for pagination'
    })
    @ApiQuery({ 
        name: 'limit', 
        required: false, 
        type: 'number',
        description: 'Items per page'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Users retrieved successfully',
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
                                            email: { type: 'string', example: 'user@example.com' },
                                            username: { type: 'string', example: 'john_doe' },
                                            role: { 
                                                type: 'string', 
                                                enum: Object.values(UserRole),
                                                example: 'consumer'
                                            },
                                            status: { type: 'number', example: 1 },
                                            createdAt: { type: 'string', format: 'date-time' },
                                            lastLoginAt: { type: 'string', format: 'date-time', nullable: true }
                                        }
                                    }
                                },
                                total: { type: 'number', example: 100 },
                                page: { type: 'number', example: 1 },
                                pages: { type: 'number', example: 10 }
                            }
                        }
                    }
                }
            ]
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Not an admin' })
    async getUsers(@Query() query: { role?: UserRole; status?: number; page?: number; limit?: number }) {
        const result = await this.adminService.getAllUsers(query);
        return new BaseSerializer(200, true, 'Users retrieved successfully', result, null);
    }

    @Post('users/:id/status')
    @ApiBearerAuth('access-token')
    @ApiOperation({ 
        summary: 'Update user status [POST /api/v1/admin/users/:id/status]',
        description: 'Update the status of a user (activate/deactivate)'
    })
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'ID of the user to update'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'User status updated successfully',
        schema: {
            allOf: [
                { $ref: '#/components/schemas/BaseSerializer' },
                {
                    properties: {
                        data: {
                            type: 'object',
                            properties: {
                                id: { type: 'number', example: 1 },
                                status: { type: 'number', example: 1 },
                                updatedAt: { type: 'string', format: 'date-time' }
                            }
                        }
                    }
                }
            ]
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Not an admin' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async updateUserStatus(
        @Param('id', ParseIntPipe) userId: number,
        @Body('status', ParseIntPipe) status: number,
        @Req() req
    ) {
        const result = await this.adminService.updateUserStatus(userId, status, req.user.id);
        return new BaseSerializer(200, true, 'User status updated successfully', result, null);
    }

    @Get('stats/system')
    @ApiBearerAuth('access-token')
    @ApiOperation({ 
        summary: 'Get system stats [GET /api/v1/admin/stats/system]',
        description: 'Retrieve system statistics including user counts, active bookings, etc.'
    })
    @ApiQuery({ 
        name: 'startDate', 
        required: false, 
        type: 'string',
        description: 'Start date for stats (ISO format)',
        example: '2025-01-01T00:00:00Z'
    })
    @ApiQuery({ 
        name: 'endDate', 
        required: false, 
        type: 'string',
        description: 'End date for stats (ISO format)',
        example: '2025-12-31T23:59:59Z'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'System stats retrieved successfully',
        schema: {
            allOf: [
                { $ref: '#/components/schemas/BaseSerializer' },
                {
                    properties: {
                        data: {
                            type: 'object',
                            properties: {
                                totalUsers: { type: 'number', example: 1000 },
                                activeUsers: { type: 'number', example: 950 },
                                totalBrands: { type: 'number', example: 50 },
                                totalFields: { type: 'number', example: 200 },
                                totalBookings: { type: 'number', example: 5000 },
                                activeBookings: { type: 'number', example: 100 },
                                averageBookingDuration: { type: 'number', example: 90 },
                                revenue: {
                                    type: 'object',
                                    properties: {
                                        daily: { type: 'number', example: 1500 },
                                        weekly: { type: 'number', example: 10500 },
                                        monthly: { type: 'number', example: 45000 }
                                    }
                                },
                                growth: {
                                    type: 'object',
                                    properties: {
                                        users: { type: 'number', example: 15 },
                                        bookings: { type: 'number', example: 25 },
                                        revenue: { type: 'number', example: 20 }
                                    }
                                }
                            }
                        }
                    }
                }
            ]
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Not an admin' })
    async getSystemStats(@Query() query: { startDate?: string; endDate?: string }) {
        const dateRange = query.startDate && query.endDate ? {
            start: new Date(query.startDate),
            end: new Date(query.endDate)
        } : undefined;

        const result = await this.adminService.getSystemStats(dateRange);
        return new BaseSerializer(200, true, 'System stats retrieved successfully', result, null);
    }

    @Get('stats/bookings')
    @ApiBearerAuth('access-token')
    @ApiOperation({ 
        summary: 'Get booking stats [GET /api/v1/admin/stats/bookings]',
        description: 'Retrieve detailed booking statistics'
    })
    @ApiQuery({ 
        name: 'startDate', 
        required: false, 
        type: 'string',
        description: 'Start date for stats (ISO format)',
        example: '2025-01-01T00:00:00Z'
    })
    @ApiQuery({ 
        name: 'endDate', 
        required: false, 
        type: 'string',
        description: 'End date for stats (ISO format)',
        example: '2025-12-31T23:59:59Z'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Booking stats retrieved successfully',
        schema: {
            allOf: [
                { $ref: '#/components/schemas/BaseSerializer' },
                {
                    properties: {
                        data: {
                            type: 'object',
                            properties: {
                                totalBookings: { type: 'number', example: 5000 },
                                completedBookings: { type: 'number', example: 4800 },
                                cancelledBookings: { type: 'number', example: 200 },
                                averageDuration: { type: 'number', example: 90 },
                                popularTimeSlots: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            hour: { type: 'number', example: 18 },
                                            bookings: { type: 'number', example: 500 }
                                        }
                                    }
                                },
                                popularFields: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            fieldId: { type: 'number' },
                                            name: { type: 'string' },
                                            bookings: { type: 'number' },
                                            revenue: { type: 'number' }
                                        }
                                    }
                                },
                                revenueStats: {
                                    type: 'object',
                                    properties: {
                                        total: { type: 'number', example: 100000 },
                                        average: { type: 'number', example: 20 },
                                        byMonth: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    month: { type: 'string', example: '2025-04' },
                                                    revenue: { type: 'number', example: 25000 }
                                                }
                                            }
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
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Not an admin' })
    async getBookingStats(@Query() query: { startDate?: string; endDate?: string }) {
        const dateRange = query.startDate && query.endDate ? {
            start: new Date(query.startDate),
            end: new Date(query.endDate)
        } : undefined;

        const result = await this.adminService.getBookingStats(dateRange);
        return new BaseSerializer(200, true, 'Booking stats retrieved successfully', result, null);
    }

    @Get('users/:id/activity')
    @ApiBearerAuth('access-token')
    @ApiOperation({ 
        summary: 'Get user activity [GET /api/v1/admin/users/:id/activity]',
        description: 'Retrieve activity logs for a specific user'
    })
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'ID of the user'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'User activity retrieved successfully',
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
                                    action: { type: 'string', example: 'LOGIN' },
                                    details: { type: 'object' },
                                    ip: { type: 'string', example: '192.168.1.1' },
                                    userAgent: { type: 'string' },
                                    performedAt: { type: 'string', format: 'date-time' }
                                }
                            }
                        }
                    }
                }
            ]
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Not an admin' })
    @ApiResponse({ status: 404, description: 'User not found' })
    async getUserActivity(@Param('id', ParseIntPipe) userId: number) {
        const result = await this.adminService.getUserActivity(userId);
        return new BaseSerializer(200, true, 'User activity retrieved successfully', result, null);
    }
}