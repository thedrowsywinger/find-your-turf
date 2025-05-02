import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BrandManagementModule } from './brand-management/brand-management.module';
import { FieldManagementModule } from './field-management/field-management.module';
import { AuthModule } from './auth/auth.module';
import { BookingModule } from './booking/booking.module';
import { AdminModule } from './admin/admin.module';
import { UserManagementController } from './user-management/user-management.controller';
import { UserManagementService } from './user-management/user-management.service';
import { UserManagementModule } from './user-management/user-management.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'super_postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_NAME', 'find_your_turf'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsRun: true,
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([{
      ttl: 60,
      limit: 100, // Default limit
    }, {
      ttl: 60,
      limit: 5, // Stricter limit for auth endpoints
      ignoreUserAgents: [/^postman/i], // Ignore Postman requests during development
      skipIf: () => process.env.NODE_ENV === 'development',
    }]),
    AuthModule,
    BrandManagementModule,
    FieldManagementModule,
    BookingModule,
    AdminModule,
    UserManagementModule,
  ],
  controllers: [AppController, UserManagementController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    UserManagementService,
  ],
})
export class AppModule {}
