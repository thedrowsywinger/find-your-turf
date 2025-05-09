import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req, HttpStatus, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiExtraModels, ApiBody } from '@nestjs/swagger';
import { BaseSerializer } from '../app.serializer';
import { UserManagementService } from './user-management.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { UserRole } from '../db-modules/users.entity';
import { AuditActionType } from '../db-modules/audit-logs.entity';
import { CreateStaffUserDto, UpdateStaffUserDto } from './dto/staff-user.dto';
import { AuditLogQueryDto } from './dto/audit-log.dto';
import { ApiResponseMessages } from '../common/api-response-messages';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiExtraModels(BaseSerializer, CreateStaffUserDto, UpdateStaffUserDto)
export class UserManagementController {
  constructor(private readonly userManagementService: UserManagementService) {}
  
  @Post('staff')
  @Roles(UserRole.COMPANY, UserRole.FACILITY_MANAGER)
  @RequirePermissions('canManageStaff')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create staff user',
    description: 'Create a new staff user account with specific permissions. Only accessible to company users and facility managers with staff management permission.'
  })
  @ApiBody({
    type: CreateStaffUserDto,
    description: 'Staff user details including role and permissions',
    required: true
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Staff user created successfully',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/BaseSerializer' },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 5 },
                code: { type: 'string', example: 'usr_abc123' },
                username: { type: 'string', example: 'facility_manager1' },
                email: { type: 'string', example: 'manager@example.com' },
                role: { type: 'string', enum: ['facility_manager', 'maintenance_staff', 'customer_service'], example: 'facility_manager' },
                permissions: { 
                  type: 'object',
                  properties: {
                    canManageStaff: { type: 'boolean', example: true },
                    canManageBookings: { type: 'boolean', example: true },
                    canUpdateSchedules: { type: 'boolean', example: true },
                    canRespondToReviews: { type: 'boolean', example: true },
                    canAccessReports: { type: 'boolean', example: true },
                    canUpdatePricing: { type: 'boolean', example: true },
                    canModifyFacilities: { type: 'boolean', example: true }
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
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data or email already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async createStaffUser(@Body() createStaffDto: CreateStaffUserDto, @Req() req): Promise<BaseSerializer> {
    try {
      const staff = await this.userManagementService.createStaffUser(createStaffDto, req.user);
      
      return new BaseSerializer(
        HttpStatus.CREATED,
        true,
        'Staff user created successfully',
        staff,
        null
      );
    } catch (error) {
      return new BaseSerializer(
        HttpStatus.BAD_REQUEST,
        false,
        error.message,
        null,
        [error.message]
      );
    }
  }

  @Get('staff')
  @Roles(UserRole.COMPANY, UserRole.FACILITY_MANAGER, UserRole.ADMIN)
  @RequirePermissions('canManageStaff')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'List staff users',
    description: 'Get a list of all staff users under the current user or organization'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Staff users retrieved successfully',
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
                  id: { type: 'number' },
                  code: { type: 'string' },
                  username: { type: 'string' },
                  email: { type: 'string' },
                  role: { type: 'string', enum: ['facility_manager', 'maintenance_staff', 'customer_service'] },
                  permissions: { type: 'object' },
                  status: { type: 'number' },
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
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async getAllStaff(@Req() req): Promise<BaseSerializer> {
    try {
      const staffUsers = await this.userManagementService.getAllStaff(req.user);
      
      return new BaseSerializer(
        HttpStatus.OK,
        true,
        ApiResponseMessages.SUCCESS,
        staffUsers,
        null
      );
    } catch (error) {
      return new BaseSerializer(
        HttpStatus.BAD_REQUEST,
        false,
        error.message,
        null,
        [error.message]
      );
    }
  }

  @Get('staff/:id')
  @Roles(UserRole.COMPANY, UserRole.FACILITY_MANAGER, UserRole.ADMIN)
  @RequirePermissions('canManageStaff')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get staff user details',
    description: 'Get detailed information about a specific staff user'
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the staff user',
    type: 'number'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Staff user details retrieved successfully',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/BaseSerializer' },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                code: { type: 'string' },
                username: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string', enum: ['facility_manager', 'maintenance_staff', 'customer_service'] },
                permissions: { type: 'object' },
                status: { type: 'number' },
                createdAt: { type: 'string', format: 'date-time' }
              }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Staff user not found' })
  async getStaffById(@Param('id', ParseIntPipe) id: number, @Req() req): Promise<BaseSerializer> {
    try {
      const staff = await this.userManagementService.getStaffById(id, req.user);
      
      return new BaseSerializer(
        HttpStatus.OK,
        true,
        ApiResponseMessages.SUCCESS,
        staff,
        null
      );
    } catch (error) {
      return new BaseSerializer(
        HttpStatus.BAD_REQUEST,
        false,
        error.message,
        null,
        [error.message]
      );
    }
  }

  @Put('staff/:id')
  @Roles(UserRole.COMPANY, UserRole.FACILITY_MANAGER, UserRole.ADMIN)
  @RequirePermissions('canManageStaff')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Update staff user',
    description: 'Update information or permissions for a specific staff user'
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the staff user to update',
    type: 'number'
  })
  @ApiBody({
    type: UpdateStaffUserDto,
    description: 'Updated staff user details',
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Staff user updated successfully',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/BaseSerializer' },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                code: { type: 'string' },
                username: { type: 'string' },
                email: { type: 'string' },
                role: { type: 'string', enum: ['facility_manager', 'maintenance_staff', 'customer_service'] },
                permissions: { type: 'object' },
                status: { type: 'number' },
                updatedAt: { type: 'string', format: 'date-time' }
              }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data or email already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Staff user not found' })
  async updateStaffUser(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateStaffDto: UpdateStaffUserDto, 
    @Req() req
  ): Promise<BaseSerializer> {
    try {
      const updatedStaff = await this.userManagementService.updateStaffUser(id, updateStaffDto, req.user);
      
      return new BaseSerializer(
        HttpStatus.OK,
        true,
        'Staff user updated successfully',
        updatedStaff,
        null
      );
    } catch (error) {
      return new BaseSerializer(
        HttpStatus.BAD_REQUEST,
        false,
        error.message,
        null,
        [error.message]
      );
    }
  }

  @Delete('staff/:id')
  @Roles(UserRole.COMPANY, UserRole.FACILITY_MANAGER, UserRole.ADMIN)
  @RequirePermissions('canManageStaff')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Remove staff user',
    description: 'Deactivate a staff user account (sets status to inactive)'
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the staff user to remove',
    type: 'number'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Staff user removed successfully',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/BaseSerializer' },
        {
          properties: {
            message: { type: 'string', example: 'Staff user deactivated successfully' }
          }
        }
      ]
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Staff user not found' })
  async removeStaffUser(@Param('id', ParseIntPipe) id: number, @Req() req): Promise<BaseSerializer> {
    try {
      await this.userManagementService.removeStaffUser(id, req.user);
      
      return new BaseSerializer(
        HttpStatus.OK,
        true,
        'Staff user deactivated successfully',
        null,
        null
      );
    } catch (error) {
      return new BaseSerializer(
        HttpStatus.BAD_REQUEST,
        false,
        error.message,
        null,
        [error.message]
      );
    }
  }

  @Get('audit-logs')
  @Roles(UserRole.COMPANY, UserRole.FACILITY_MANAGER, UserRole.ADMIN)
  @RequirePermissions('canAccessReports')
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get audit logs',
    description: 'Retrieve audit logs with optional filtering by user, action, date range, etc.'
  })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter logs by user ID', type: Number })
  @ApiQuery({ name: 'fieldId', required: false, description: 'Filter logs by field ID', type: Number })
  @ApiQuery({ name: 'action', required: false, description: 'Filter logs by action type', enum: AuditActionType })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for log filtering (ISO format)', type: String })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for log filtering (ISO format)', type: String })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page for pagination', type: Number })
  @ApiResponse({ 
    status: 200, 
    description: 'Audit logs retrieved successfully',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/BaseSerializer' },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                logs: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'number' },
                      action: { type: 'string', enum: Object.values(AuditActionType) },
                      userId: { 
                        type: 'object',
                        properties: {
                          id: { type: 'number' },
                          username: { type: 'string' }
                        }
                      },
                      details: { type: 'object' },
                      timestamp: { type: 'string', format: 'date-time' },
                      ipAddress: { type: 'string', nullable: true },
                      userAgent: { type: 'string', nullable: true }
                    }
                  }
                },
                total: { type: 'number' }
              }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async getAuditLogs(@Query() queryParams: AuditLogQueryDto, @Req() req): Promise<BaseSerializer> {
    try {
      const result = await this.userManagementService.getAuditLogs(queryParams, req.user);
      
      return new BaseSerializer(
        HttpStatus.OK,
        true,
        ApiResponseMessages.SUCCESS,
        result,
        null
      );
    } catch (error) {
      return new BaseSerializer(
        HttpStatus.BAD_REQUEST,
        false,
        error.message,
        null,
        [error.message]
      );
    }
  }
}
