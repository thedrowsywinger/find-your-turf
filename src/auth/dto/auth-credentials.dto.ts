import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../db-modules/users.entity';

export class AuthCredentialsDto {
  @ApiProperty({ 
    description: 'Username of the user',
    example: 'john_doe'
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ 
    description: 'Email address of the user',
    example: 'john@example.com'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    description: 'Password for the account (minimum 8 characters)',
    example: 'password123',
    minLength: 8
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ 
    description: 'User role in the system',
    enum: UserRole,
    example: UserRole.CONSUMER
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}

export class LoginDto {
  @ApiProperty({ 
    description: 'Email address of the user',
    example: 'john@example.com'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    description: 'Password for the account',
    example: 'password123'
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}