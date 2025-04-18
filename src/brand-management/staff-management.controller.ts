import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam, ApiQuery, ApiExtraModels } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { StaffPermissionsGuard } from '../auth/guards/staff-permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { UserRole } from '../db-modules/users.entity';
import { StaffManagementService } from './staff-management.service';
import { CreateStaffDto, UpdateStaffPermissionsDto, ListStaffQueryDto } from './dto/staff-management.dto';
import { BaseSerializer } from '../app.serializer';

@ApiTags('staff-management')
@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiExtraModels(BaseSerializer)
export class StaffManagementController {
    constructor(private readonly staffManagementService: StaffManagementService) {}

    @Post()
    @Roles(UserRole.COMPANY)
    @ApiBearerAuth('access-token')
    @ApiOperation({ 
        summary: 'Create staff member [POST /api/v1/staff]', 
        description: 'Create a new staff member with specified role and permissions' 
    })
    @ApiBody({
        type: CreateStaffDto,
        description: 'Staff member details and permissions',
        required: true
    })
    @ApiResponse({ 
        status: 201, 
        description: 'Staff member created successfully',
        schema: {
            allOf: [
                { $ref: '#/components/schemas/BaseSerializer' },
                {
                    properties: {
                        data: {
                            type: 'object',
                            properties: {
                                id: { type: 'number', example: 1 },
                                email: { type: 'string', example: 'staff@example.com' },
                                username: { type: 'string', example: 'john_smith' },
                                role: { type: 'string', enum: ['facility_manager', 'maintenance_staff', 'customer_service'] },
                                permissions: {
                                    type: 'object',
                                    properties: {
                                        canManageStaff: { type: 'boolean' },
                                        canManageBookings: { type: 'boolean' },
                                        canUpdateSchedules: { type: 'boolean' },
                                        canRespondToReviews: { type: 'boolean' },
                                        canAccessReports: { type: 'boolean' }
                                    }
                                },
                                status: { type: 'number', example: 1 },
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
        description: 'Invalid input',
        type: BaseSerializer
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized',
        type: BaseSerializer
    })
    async createStaffMember(
        @Body() createDto: CreateStaffDto,
        @Req() req
    ): Promise<BaseSerializer> {
        const { data, error } = await this.staffManagementService.createStaffMember(
            createDto,
            req.user.id
        );

        if (error) {
            return new BaseSerializer(400, false, error, null, [error]);
        }

        return new BaseSerializer(201, true, 'Staff member created successfully', data, null);
    }

    @Put(':staffId/permissions')
    @Roles(UserRole.COMPANY)
    @ApiBearerAuth('access-token')
    @ApiOperation({ 
        summary: 'Update staff permissions [PUT /api/v1/staff/{staffId}/permissions]', 
        description: 'Update permissions for a staff member' 
    })
    @ApiParam({
        name: 'staffId',
        description: 'ID of the staff member',
        type: 'number',
        required: true
    })
    @ApiBody({
        type: UpdateStaffPermissionsDto,
        description: 'Updated staff permissions',
        required: true
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Staff permissions updated successfully',
        schema: {
            allOf: [
                { $ref: '#/components/schemas/BaseSerializer' },
                {
                    properties: {
                        data: {
                            type: 'object',
                            properties: {
                                id: { type: 'number', example: 1 },
                                permissions: {
                                    type: 'object',
                                    properties: {
                                        canManageStaff: { type: 'boolean' },
                                        canManageBookings: { type: 'boolean' },
                                        canUpdateSchedules: { type: 'boolean' },
                                        canRespondToReviews: { type: 'boolean' },
                                        canAccessReports: { type: 'boolean' }
                                    }
                                },
                                updatedAt: { type: 'string', format: 'date-time' }
                            }
                        }
                    }
                }
            ]
        }
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Invalid input',
        type: BaseSerializer
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized',
        type: BaseSerializer
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Staff member not found',
        type: BaseSerializer
    })
    async updateStaffPermissions(
        @Param('staffId', ParseIntPipe) staffId: number,
        @Body() updateDto: UpdateStaffPermissionsDto,
        @Req() req
    ): Promise<BaseSerializer> {
        const { data, error } = await this.staffManagementService.updateStaffPermissions(
            staffId,
            updateDto,
            req.user.id
        );

        if (error) {
            return new BaseSerializer(400, false, error, null, [error]);
        }

        return new BaseSerializer(200, true, 'Staff permissions updated successfully', data, null);
    }

    @Get()
    @Roles(UserRole.COMPANY)
    @ApiBearerAuth('access-token')
    @ApiOperation({ 
        summary: 'List staff members [GET /api/v1/staff]', 
        description: 'Get a list of all staff members with optional filtering' 
    })
    @ApiQuery({ 
        name: 'role', 
        required: false, 
        enum: ['facility_manager', 'maintenance_staff', 'customer_service'],
        description: 'Filter by staff role'
    })
    @ApiQuery({ 
        name: 'status', 
        required: false, 
        type: 'number',
        description: 'Filter by staff status (1: active, 0: inactive)'
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
        description: 'Number of items per page'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Staff members retrieved successfully',
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
                                            email: { type: 'string', example: 'staff@example.com' },
                                            username: { type: 'string', example: 'john_smith' },
                                            role: { type: 'string', enum: ['facility_manager', 'maintenance_staff', 'customer_service'] },
                                            status: { type: 'number', example: 1 },
                                            createdAt: { type: 'string', format: 'date-time' }
                                        }
                                    }
                                },
                                total: { type: 'number', example: 10 },
                                page: { type: 'number', example: 1 },
                                pages: { type: 'number', example: 2 }
                            }
                        }
                    }
                }
            ]
        }
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized',
        type: BaseSerializer
    })
    async listStaffMembers(
        @Query() query: ListStaffQueryDto,
        @Req() req
    ): Promise<BaseSerializer> {
        const { data, error } = await this.staffManagementService.listStaffMembers(
            req.user.id,
            query
        );

        if (error) {
            return new BaseSerializer(400, false, error, null, [error]);
        }

        return new BaseSerializer(200, true, 'Staff members retrieved successfully', data, null);
    }

    @Delete(':staffId')
    @Roles(UserRole.COMPANY)
    @ApiBearerAuth('access-token')
    @ApiOperation({ 
        summary: 'Remove staff member [DELETE /api/v1/staff/{staffId}]', 
        description: 'Remove a staff member from the system (soft delete)' 
    })
    @ApiParam({
        name: 'staffId',
        description: 'ID of the staff member to remove',
        type: 'number',
        required: true
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Staff member removed successfully',
        type: BaseSerializer
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized',
        type: BaseSerializer
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Forbidden - Not authorized to remove this staff member',
        type: BaseSerializer
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Staff member not found',
        type: BaseSerializer
    })
    async removeStaffMember(
        @Param('staffId', ParseIntPipe) staffId: number,
        @Req() req
    ): Promise<BaseSerializer> {
        const { data, error } = await this.staffManagementService.removeStaffMember(
            staffId,
            req.user.id
        );

        if (error) {
            return new BaseSerializer(400, false, error, null, [error]);
        }

        return new BaseSerializer(200, true, 'Staff member removed successfully', data, null);
    }

    @Get(':staffId/audit-logs')
    @Roles(UserRole.COMPANY)
    @ApiBearerAuth('access-token')
    @ApiOperation({ 
        summary: 'Get staff audit logs [GET /api/v1/staff/{staffId}/audit-logs]', 
        description: 'Retrieve audit logs for a specific staff member' 
    })
    @ApiParam({
        name: 'staffId',
        description: 'ID of the staff member',
        type: 'number',
        required: true
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Audit logs retrieved successfully',
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
                                    action: { type: 'string', example: 'UPDATE_SCHEDULE' },
                                    details: { type: 'object' },
                                    performedAt: { type: 'string', format: 'date-time' },
                                    ip: { type: 'string', example: '192.168.1.1' },
                                    userAgent: { type: 'string' }
                                }
                            }
                        }
                    }
                }
            ]
        }
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized',
        type: BaseSerializer
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Staff member not found',
        type: BaseSerializer
    })
    async getStaffAuditLogs(
        @Param('staffId', ParseIntPipe) staffId: number,
        @Req() req
    ): Promise<BaseSerializer> {
        const { data, error } = await this.staffManagementService.getStaffAuditLogs(
            staffId,
            req.user.id
        );

        if (error) {
            return new BaseSerializer(400, false, error, null, [error]);
        }

        return new BaseSerializer(200, true, 'Audit logs retrieved successfully', data, null);
    }
}