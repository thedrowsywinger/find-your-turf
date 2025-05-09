import { Module } from '@nestjs/common';
import { FieldManagementService } from './field-management.service';
import { FieldManagementController } from './field-management.controller';
import { Fields } from 'src/db-modules/fields.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brands } from 'src/db-modules/brands.entity';
import { Bookings } from 'src/db-modules/bookings.entity';
import { FieldSchedules } from 'src/db-modules/field-schedules.entity';
import { FieldReviews } from 'src/db-modules/field-reviews.entity';
import { LoggingModule } from '../common/logging/logging.module';
import { NotificationModule } from '../common/notifications/notification.module';
import { FieldPricing } from '../db-modules/field-pricing.entity';
import { Users } from '../db-modules/users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Fields,
      Brands,
      Bookings,
      FieldSchedules,
      FieldReviews,
      FieldPricing,
      Users
    ]),
    LoggingModule,
    NotificationModule
  ],
  providers: [FieldManagementService],
  controllers: [FieldManagementController],
  exports: [FieldManagementService]
})
export class FieldManagementModule {}
