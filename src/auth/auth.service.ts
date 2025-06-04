import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '../db-modules/users.entity';
import { AuthCredentialsDto, LoginDto } from './dto/auth-credentials.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { LoggingService } from '../common/logging/logging.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    private userRepository: Repository<Users>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private loggingService: LoggingService,
  ) {}

  async register(authCredentialsDto: AuthCredentialsDto): Promise<{ accessToken: string, refreshToken: string }> {
    const { username, email, password, role } = authCredentialsDto;

    // Hash password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      role,
      createdBy: 1, // System created
      status: 1,
    });

    try {
      const savedUser = await this.userRepository.save(user);
      this.loggingService.audit('USER_REGISTERED', savedUser.id, { 
        username, 
        email, 
        role,
        timestamp: new Date()
      });
      return this.generateTokens(savedUser);
    } catch (error) {
      if (error.code === '23505') { // Duplicate email
        this.loggingService.security('REGISTRATION_FAILED', { 
          reason: 'Duplicate email',
          email
        });
        throw new ConflictException('Email already exists');
      }
      this.loggingService.error('Registration error', error.stack, { email });
      throw new InternalServerErrorException();
    }
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string, refreshToken: string }> {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password))) {
      this.loggingService.audit('USER_LOGIN', user.id, { 
        email,
        timestamp: new Date()
      });
      return this.generateTokens(user);
    }

    this.loggingService.security('LOGIN_FAILED', { 
      email,
      timestamp: new Date()
    });
    throw new UnauthorizedException('Invalid credentials');
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepository.findOne({ where: { email: payload.email } });

      if (!user || user.refreshToken !== refreshToken) {
        this.loggingService.security('INVALID_REFRESH_TOKEN', { 
          email: payload.email,
          timestamp: new Date()
        });
        throw new UnauthorizedException('Invalid refresh token');
      }

      const accessToken = this.jwtService.sign(
        { email: user.email, role: user.role },
        {
          secret: this.configService.get('JWT_SECRET'),
          expiresIn: '7d', // 7 days
        },
      );

      this.loggingService.audit('TOKEN_REFRESHED', user.id, { 
        email: user.email,
        timestamp: new Date()
      });

      return { accessToken };
    } catch (error) {
      this.loggingService.error('Token refresh error', error.stack);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getProfileByEmail(email: string): Promise<Partial<Users>> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) return null;
    // Exclude sensitive fields
    const { password, refreshToken, ...profile } = user;
    return profile;
  }

  private async generateTokens(user: Users): Promise<{ accessToken: string, refreshToken: string }> {
    const payload = { email: user.email, role: user.role };
    
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '7d', // 7 days
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: '7d', // 7 days
    });

    // Save refresh token in database
    user.refreshToken = refreshToken;
    await this.userRepository.save(user);

    return { accessToken, refreshToken };
  }
  
}