import { Body, Controller, Get, HttpStatus, Post, UseGuards, Param, Put, Delete, Req, Query } from '@nestjs/common';
import { BrandManagementService } from './brand-management.service';
import { ApiResponseMessages } from 'src/common/api-response-messages';
import { BaseSerializer } from 'src/app.serializer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../db-modules/users.entity';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiExtraModels, ApiQuery } from '@nestjs/swagger';
import { JwtRolesGuard } from '../auth/guards/jwt-role.guard';
import { CreateBrandDto } from './dto/brand-info.dto';

@ApiTags('brands')
@Controller('brand')
@ApiBearerAuth('access-token')
// @UseGuards(JwtRolesGuard(UserRole.COMPANY, UserRole.ADMIN))
@ApiExtraModels(BaseSerializer, CreateBrandDto)
export class BrandManagementController {
    constructor(private readonly brandManagementService: BrandManagementService) {}

    @Post('create')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtRolesGuard(UserRole.COMPANY))
    @ApiOperation({ 
        summary: 'Create new brand [POST /api/v1/brand/create]',
        description: 'Create a new brand with initial field information. Only company administrators can create brands.' 
    })
    @ApiBody({
        type: CreateBrandDto,
        description: 'Brand information including name, description, contact details, and initial field configuration',
        required: true,
        schema: {
            example: {
                name: 'Premier Sports Complex',
                description: 'Premier sports facility offering multiple fields and amenities',
                contactEmail: 'contact@premiersports.com',
                contactPhone: '+1234567890',
                fullAddress: 'Bashundhara R/A Dhaka, Bangladesh',
                fields: [
                    {
                        name: 'Main Soccer Field',
                        sportType: 'soccer',
                        description: 'Professional grade natural grass field',
                        facilities: ['Floodlights', 'Changing Rooms', 'Spectator Seating']
                    }
                ]
            }
        }
    })
    @ApiResponse({ 
        status: 201, 
        description: 'Brand created successfully',
        schema: {
            allOf: [
                { $ref: '#/components/schemas/BaseSerializer' },
                {
                    properties: {
                        data: {
                            type: 'object',
                            properties: {
                                id: { type: 'number', example: 1 },
                                name: { type: 'string', example: 'Premier Sports' },
                                description: { type: 'string', example: 'Premium sports facilities' },
                                code: { type: 'string', example: 'PRE001' },
                                status: { type: 'number', example: 1 },
                                createdAt: { type: 'string', format: 'date-time' },
                                fields: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'number' },
                                            name: { type: 'string' },
                                            status: { type: 'number' }
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
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Invalid or missing token',
        type: BaseSerializer
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Forbidden - User is not a company',
        type: BaseSerializer
    })
    async createBrand(
        @Body() brandInfo: CreateBrandDto,
        @Req() request
    ) {
        const { data, error } = await this.brandManagementService.createBrandService(brandInfo, request.user);
        if (error) {
            return new BaseSerializer(
                HttpStatus.NOT_FOUND,
                false,
                error,
                data,
                [error]
            )
        } else {
            return new BaseSerializer(
                HttpStatus.OK,
                true,
                ApiResponseMessages.SUCCESS,
                data,
                error
            );
        };
    }

    @Get('list')
    @ApiBearerAuth('access-token')
    @ApiOperation({ 
        summary: 'List all brands [GET /api/v1/brand/list]',
        description: 'Get a paginated list of all brands with their basic information including field count and status' 
    })
    @ApiQuery({ 
        name: 'page', 
        required: false, 
        type: Number, 
        description: 'Page number for pagination',
        example: 1 
    })
    @ApiQuery({ 
        name: 'limit', 
        required: false, 
        type: Number, 
        description: 'Number of items per page',
        example: 10 
    })
    @ApiQuery({ 
        name: 'status', 
        required: false, 
        type: Number, 
        description: 'Filter brands by status (1: Active, 0: Inactive)',
        enum: [0, 1]
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Brands retrieved successfully',
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
                                            name: { type: 'string', example: 'Premier Sports' },
                                            description: { type: 'string', example: 'Premier sports facility' },
                                            code: { type: 'string', example: 'PRE001' },
                                            status: { type: 'number', example: 1 },
                                            fieldsCount: { type: 'number', example: 5 },
                                            activeFieldsCount: { type: 'number', example: 4 },
                                            contact: {
                                                type: 'object',
                                                properties: {
                                                    email: { type: 'string' },
                                                    phone: { type: 'string' }
                                                }
                                            },
                                            location: {
                                                type: 'object',
                                                properties: {
                                                    city: { type: 'string' },
                                                    state: { type: 'string' },
                                                    country: { type: 'string' }
                                                }
                                            },
                                            createdAt: { type: 'string', format: 'date-time' },
                                            updatedAt: { type: 'string', format: 'date-time' }
                                        }
                                    }
                                },
                                pagination: {
                                    type: 'object',
                                    properties: {
                                        total: { type: 'number', example: 50 },
                                        pages: { type: 'number', example: 5 },
                                        page: { type: 'number', example: 1 },
                                        limit: { type: 'number', example: 10 }
                                    }
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
    async listBrands() {
        const { data, error } = await this.brandManagementService.listBrandsService();
        if (error) {
            return new BaseSerializer(
                HttpStatus.NOT_FOUND,
                false,
                error,
                data,
                [error]
            )
        } else {
            return new BaseSerializer(
                HttpStatus.OK,
                true,
                ApiResponseMessages.SUCCESS,
                data,
                error
            );
        };
    }

    @Post('approve')
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth('access-token')
    @ApiOperation(
        {
            summary: 'Approve brand [POST /api/v1/brand/approve]',
            description: 'Approve a brand request. Only admin can approve brands.' 
        }
    )
    @ApiParam(
        {
            name: 'brandId',
            description: 'Unique identifier of the brand',
            type: 'number',
            required: true
        }
    )
    @ApiResponse({ 
        status: 200, 
        description: 'Brand approved successfully',
        schema: {
            allOf: [
                { $ref: '#/components/schemas/BaseSerializer' },
                {
                    properties: {
                        data: {
                            type: 'object',
                            properties: {
                                id: { type: 'number', example: 1 },
                                name: { type: 'string', example: 'Premier Sports' },
                                status: { type: 'number', example: 1 }
                            }
                        }
                    }
                }
            ]
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized - Invalid or missing token',
        type: BaseSerializer
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - User is not an admin',
        type: BaseSerializer
    })
    @ApiResponse({
        status: 404,
        description: 'Brand not found',
        type: BaseSerializer
    })
    async approveBrand(
        @Body('brandId') brandId: number,
        @Req() req
    ) {
        const { data, error } = await this.brandManagementService.approveABrandService(brandId, req.user);
        if (error) {
            return new BaseSerializer(
                HttpStatus.NOT_FOUND,
                false,
                error,
                data,
                [error]
            )
        } else {
            return new BaseSerializer(
                HttpStatus.OK,
                true,
                ApiResponseMessages.SUCCESS,
                data,
                error
            );
        };
    }

    @Get(':brandId')
    @UseGuards(JwtRolesGuard(UserRole.ADMIN))
    @ApiBearerAuth('access-token')
    @ApiOperation({ 
        summary: 'Get brand details [GET /api/v1/brand/{brandId}]',
        description: 'Get comprehensive information about a specific brand including all fields, schedules, and analytics' 
    })
    @ApiParam({
        name: 'brandId',
        description: 'Unique identifier of the brand',
        type: 'number',
        required: true
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Brand details retrieved successfully',
        schema: {
            allOf: [
                { $ref: '#/components/schemas/BaseSerializer' },
                {
                    properties: {
                        data: {
                            type: 'object',
                            properties: {
                                id: { type: 'number', example: 1 },
                                name: { type: 'string', example: 'Premier Sports' },
                                description: { type: 'string', example: 'Premier sports facility' },
                                code: { type: 'string', example: 'PRE001' },
                                status: { type: 'number', example: 1 },
                                contact: {
                                    type: 'object',
                                    properties: {
                                        email: { type: 'string', example: 'contact@premiersports.com' },
                                        phone: { type: 'string', example: '+1234567890' }
                                    }
                                },
                                address: {
                                    type: 'object',
                                    properties: {
                                        street: { type: 'string' },
                                        city: { type: 'string' },
                                        state: { type: 'string' },
                                        postalCode: { type: 'string' },
                                        country: { type: 'string' }
                                    }
                                },
                                fields: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'number' },
                                            name: { type: 'string' },
                                            sportType: { type: 'string' },
                                            status: { type: 'number' },
                                            facilities: { 
                                                type: 'array',
                                                items: { type: 'string' }
                                            },
                                            pricing: {
                                                type: 'array',
                                                items: {
                                                    type: 'object',
                                                    properties: {
                                                        duration: { type: 'number' },
                                                        price: { type: 'number' }
                                                    }
                                                }
                                            },
                                            analytics: {
                                                type: 'object',
                                                properties: {
                                                    totalBookings: { type: 'number' },
                                                    averageRating: { type: 'number' },
                                                    reviewCount: { type: 'number' }
                                                }
                                            }
                                        }
                                    }
                                },
                                analytics: {
                                    type: 'object',
                                    properties: {
                                        totalRevenue: { type: 'number' },
                                        bookingsCount: { type: 'number' },
                                        averageRating: { type: 'number' },
                                        popularFields: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    fieldId: { type: 'number' },
                                                    name: { type: 'string' },
                                                    bookings: { type: 'number' }
                                                }
                                            }
                                        }
                                    }
                                },
                                createdAt: { type: 'string', format: 'date-time' },
                                updatedAt: { type: 'string', format: 'date-time' }
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
        description: 'Brand not found',
        type: BaseSerializer
    })
    async getBrandDetailsForAdmin(@Param('brandId') brandId: string) {
        const { data, error } = await this.brandManagementService.getBrandDetailsForAdminService(brandId);
        if (error) {
            return new BaseSerializer(
                HttpStatus.NOT_FOUND,
                false,
                error,
                data,
                [error]
            )
        } else {
            return new BaseSerializer(
                HttpStatus.OK,
                true,
                ApiResponseMessages.SUCCESS,
                data,
                error
            );
        };
    }

    @Get('')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtRolesGuard(UserRole.COMPANY))
    @ApiOperation({ 
        summary: 'Get brand details for a facility owner [GET /api/v1/brand/]',
        description: 'Get comprehensive information about a specific brand including all fields, schedules, and analytics' 
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Brand details retrieved successfully',
        schema: {
            allOf: [
                { $ref: '#/components/schemas/BaseSerializer' },
                {
                    properties: {
                        data: {
                            type: 'object',
                            properties: {
                                id: { type: 'number', example: 1 },
                                name: { type: 'string', example: 'Premier Sports' },
                                description: { type: 'string', example: 'Premier sports facility' },
                                code: { type: 'string', example: 'PRE001' },
                                status: { type: 'number', example: 1 },
                                contact: {
                                    type: 'object',
                                    properties: {
                                        email: { type: 'string', example: 'contact@premiersports.com' },
                                        phone: { type: 'string', example: '+1234567890' }
                                    }
                                },
                                address: {
                                    type: 'object',
                                    properties: {
                                        street: { type: 'string' },
                                        city: { type: 'string' },
                                        state: { type: 'string' },
                                        postalCode: { type: 'string' },
                                        country: { type: 'string' }
                                    }
                                },
                                fields: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'number' },
                                            name: { type: 'string' },
                                            sportType: { type: 'string' },
                                            status: { type: 'number' },
                                            facilities: { 
                                                type: 'array',
                                                items: { type: 'string' }
                                            },
                                            pricing: {
                                                type: 'array',
                                                items: {
                                                    type: 'object',
                                                    properties: {
                                                        duration: { type: 'number' },
                                                        price: { type: 'number' }
                                                    }
                                                }
                                            },
                                            analytics: {
                                                type: 'object',
                                                properties: {
                                                    totalBookings: { type: 'number' },
                                                    averageRating: { type: 'number' },
                                                    reviewCount: { type: 'number' }
                                                }
                                            }
                                        }
                                    }
                                },
                                analytics: {
                                    type: 'object',
                                    properties: {
                                        totalRevenue: { type: 'number' },
                                        bookingsCount: { type: 'number' },
                                        averageRating: { type: 'number' },
                                        popularFields: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    fieldId: { type: 'number' },
                                                    name: { type: 'string' },
                                                    bookings: { type: 'number' }
                                                }
                                            }
                                        }
                                    }
                                },
                                createdAt: { type: 'string', format: 'date-time' },
                                updatedAt: { type: 'string', format: 'date-time' }
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
        description: 'Brand not found',
        type: BaseSerializer
    })
    async getBrandDetails(@Req() req) {
        const { data, error } = await this.brandManagementService.getBrandDetailsService(req);
        if (error) {
            return new BaseSerializer(
                HttpStatus.NOT_FOUND,
                false,
                error,
                data,
                [error]
            )
        } else {
            return new BaseSerializer(
                HttpStatus.OK,
                true,
                ApiResponseMessages.SUCCESS,
                data,
                error
            );
        };
    }

    @Put(':brandId')
    @Roles(UserRole.COMPANY)
    @ApiBearerAuth('access-token')
    @ApiOperation({ 
        summary: 'Update brand [PUT /api/v1/brand/{brandId}]',
        description: 'Update brand information'
    })
    @ApiParam({
        name: 'brandId',
        description: 'ID of the brand to update',
        type: 'number',
        required: true
    })
    @ApiBody({
        type: CreateBrandDto,
        description: 'Updated brand information',
        required: true,
        schema: {
            example: {
                name: 'Premier Sports Complex - Updated',
                description: 'Updated description of the premier sports facility',
                contactEmail: 'new.contact@premiersports.com',
                contactPhone: '+1987654321',
                address: {
                    street: '456 Sports Boulevard',
                    city: 'New Sportstown',
                    state: 'ST',
                    postalCode: '54321',
                    country: 'United States'
                }
            }
        }
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Brand updated successfully',
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
                                updatedAt: { type: 'string', format: 'date-time' }
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
        status: 403, 
        description: 'Forbidden - User is not authorized to update this brand',
        type: BaseSerializer
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Brand not found',
        type: BaseSerializer
    })
    async updateBrand(
        @Param('brandId') brandId: number,
        @Body() updateInfo: CreateBrandDto,
        @Req() req
    ) {
        const { data, error } = await this.brandManagementService.updateBrandService(brandId, updateInfo, req.user);
        if (error) {
            return new BaseSerializer(
                HttpStatus.NOT_FOUND,
                false,
                error,
                data,
                [error]
            )
        } else {
            return new BaseSerializer(
                HttpStatus.OK,
                true,
                ApiResponseMessages.SUCCESS,
                data,
                error
            );
        };
    }

    @Delete(':brandId')
    @Roles(UserRole.COMPANY)
    @ApiBearerAuth('access-token')
    @ApiOperation({ 
        summary: 'Delete brand [DELETE /api/v1/brand/{brandId}]',
        description: 'Delete a brand and all associated fields (soft delete)'
    })
    @ApiParam({
        name: 'brandId',
        description: 'ID of the brand to delete',
        type: 'number',
        required: true
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Brand deleted successfully',
        type: BaseSerializer
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized',
        type: BaseSerializer
    })
    @ApiResponse({ 
        status: 403, 
        description: 'Forbidden - User is not authorized to delete this brand',
        type: BaseSerializer
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Brand not found',
        type: BaseSerializer
    })
    async deleteBrand(
        @Param('brandId') brandId: number,
        @Req() req
    ) {
        const { data, error } = await this.brandManagementService.deleteBrandService(brandId, req.user);
        if (error) {
            return new BaseSerializer(
                HttpStatus.NOT_FOUND,
                false,
                error,
                data,
                [error]
            )
        } else {
            return new BaseSerializer(
                HttpStatus.OK,
                true,
                ApiResponseMessages.SUCCESS,
                data,
                error
            );
        };
    }
}
