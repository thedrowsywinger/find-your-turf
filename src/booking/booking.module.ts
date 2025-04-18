import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { Bookings } from '../db-modules/bookings.entity';
import { Fields } from '../db-modules/fields.entity';
import { Users } from '../db-modules/users.entity';
import { LoggingModule } from '../common/logging/logging.module';
import { NotificationModule } from '../common/notifications/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Bookings,
      Fields,
      Users,
    ]),
    LoggingModule,
    NotificationModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}