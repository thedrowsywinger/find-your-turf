import { Body, Controller, HttpStatus, Post, Get, UseGuards, Req, Headers, UnauthorizedException, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiCookieAuth, ApiBody, ApiHeader, ApiExtraModels } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthCredentialsDto, LoginDto } from './dto/auth-credentials.dto';
import { BaseSerializer } from '../app.serializer';
import { ApiResponseMessages } from '../common/api-response-messages';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthRateLimit } from './decorators/auth-rate-limit.decorator';

@ApiTags('auth')
@Controller('auth')
@ApiExtraModels(BaseSerializer)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  @AuthRateLimit()
  @ApiOperation({ 
    summary: 'Register new user [POST /api/v1/auth/register]', 
    description: 'Create a new user account with role-based access'
  })
  @ApiBody({
    type: AuthCredentialsDto,
    description: 'User registration credentials',
    required: true
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User registered successfully',
    type: BaseSerializer,
    schema: {
      allOf: [
        { $ref: '#/components/schemas/BaseSerializer' },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                accessToken: {
                  type: 'string',
                  example: 'eyJhbGciOiJ...'
                }
              }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid input or email already exists',
    type: BaseSerializer
  })
  async register(
    @Body() authCredentialsDto: AuthCredentialsDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<BaseSerializer> {
    try {
      const result = await this.authService.register(authCredentialsDto);

      // Set refresh token in httpOnly cookie
      if (result.refreshToken) {
        response.cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        delete result.refreshToken; // Don't send refresh token in response body
      }

      return new BaseSerializer(
        HttpStatus.CREATED,
        true,
        ApiResponseMessages.SUCCESS,
        { accessToken: result.accessToken },
        null,
      );
    } catch (error) {
      return new BaseSerializer(
        HttpStatus.BAD_REQUEST,
        false,
        error.message,
        null,
        [error.message],
      );
    }
  }

  @Post('/login')
  @AuthRateLimit()
  @ApiOperation({ 
    summary: 'User login [POST /api/v1/auth/login]', 
    description: 'Authenticate user and receive access token'
  })
  @ApiBody({
    type: LoginDto,
    description: 'User login credentials',
    required: true
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    type: BaseSerializer,
    schema: {
      allOf: [
        { $ref: '#/components/schemas/BaseSerializer' },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                accessToken: {
                  type: 'string',
                  example: 'eyJhbGciOiJ...'
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
    description: 'Invalid credentials',
    type: BaseSerializer
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<BaseSerializer> {
    try {
      const result = await this.authService.login(loginDto);

      // Set refresh token in httpOnly cookie
      if (result.refreshToken) {
        response.cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        delete result.refreshToken; // Don't send refresh token in response body
      }

      return new BaseSerializer(
        HttpStatus.OK,
        true,
        ApiResponseMessages.SUCCESS,
        { accessToken: result.accessToken },
        null,
      );
    } catch (error) {
      return new BaseSerializer(
        HttpStatus.UNAUTHORIZED,
        false,
        error.message,
        null,
        [error.message],
      );
    }
  }

  @Post('/refresh')
  @AuthRateLimit()
  @ApiOperation({ 
    summary: 'Refresh access token [POST /api/v1/auth/refresh]', 
    description: 'Get new access token using refresh token stored in HTTP-only cookie'
  })
  @ApiCookieAuth('refreshToken')
  @ApiHeader({
    name: 'Cookie',
    description: 'HTTP-only cookie containing refresh token',
    required: true,
    example: 'refreshToken=eyJhbGciOiJ...'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Token refreshed successfully',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/BaseSerializer' },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                accessToken: {
                  type: 'string',
                  example: 'eyJhbGciOiJ...'
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
    description: 'Invalid or missing refresh token',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/BaseSerializer' },
        {
          properties: {
            statusCode: { type: 'number', example: 401 },
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Refresh token not found' },
            data: { type: 'null', example: null },
            errors: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['Refresh token not found']
            }
          }
        }
      ]
    }
  })
  async refreshToken(
    @Req() req,
  ): Promise<BaseSerializer> {
    try {
      const refreshToken = req.cookies['refreshToken'];
      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token not found');
      }

      const result = await this.authService.refreshToken(refreshToken);

      return new BaseSerializer(
        HttpStatus.OK,
        true,
        ApiResponseMessages.SUCCESS,
        { accessToken: result.refreshToken },
        null,
      );
    } catch (error) {
      return new BaseSerializer(
        HttpStatus.UNAUTHORIZED,
        false,
        error.message,
        null,
        [error.message],
      );
    }
  }

  @Post('/logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ 
    summary: 'User logout [POST /api/v1/auth/logout]', 
    description: 'Invalidate refresh token and clear cookie'
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
    required: true,
    example: 'Bearer eyJhbGciOiJ...'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Logged out successfully',
    type: BaseSerializer
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized',
    type: BaseSerializer
  })
  async logout(
    @Req() req,
    @Res({ passthrough: true }) response: Response
  ): Promise<BaseSerializer> {
    // Clear the refresh token cookie
    response.clearCookie('refreshToken');

    return new BaseSerializer(
      HttpStatus.OK,
      true,
      'Logged out successfully',
      null,
      null,
    );
  }

  @Get('/profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ 
    summary: 'Get user profile', 
    description: 'Get detailed information about the currently authenticated user'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile retrieved successfully',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/BaseSerializer' },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 10 },
                email: { type: 'string', example: 'user@example.com' },
                fullName: { type: 'string', example: 'John Doe' },
                role: { 
                  type: 'string', 
                  enum: ['admin', 'company', 'consumer', 'facility_manager', 'maintenance_staff', 'customer_service'],
                  example: 'consumer'
                },
                parentUserId: { type: 'number', example: 5, nullable: true },
                permissions: { 
                  type: 'object',
                  nullable: true,
                  example: {
                    canManageBookings: true,
                    canUpdateSchedules: false
                  }
                },
                profileImage: { type: 'string', nullable: true },
                phoneNumber: { type: 'string', example: '+1234567890', nullable: true },
                createdAt: { type: 'string', format: 'date-time' }
              }
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  async getProfile(@Req() req): Promise<BaseSerializer> {
    const email = req.user?.email;
    if (!email) {
      return new BaseSerializer(
        HttpStatus.UNAUTHORIZED,
        false,
        'Unauthorized',
        null,
        ['Unauthorized']
      );
    }
    const profile = await this.authService.getProfileByEmail(email);
    if (!profile) {
      return new BaseSerializer(
        HttpStatus.NOT_FOUND,
        false,
        'User not found',
        null,
        ['User not found']
      );
    }
    return new BaseSerializer(
      HttpStatus.OK,
      true,
      ApiResponseMessages.SUCCESS,
      profile,
      null,
    );
  }
}