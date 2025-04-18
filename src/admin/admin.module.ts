import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../db-modules/users.entity';
import { Bookings } from '../db-modules/bookings.entity';
import { Fields } from '../db-modules/fields.entity';
import { LoggingModule } from '../common/logging/logging.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, Bookings, Fields]),
    LoggingModule
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}