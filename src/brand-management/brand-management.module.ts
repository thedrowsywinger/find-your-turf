import { Module } from '@nestjs/common';
import { BrandManagementController } from './brand-management.controller';
import { BrandManagementService } from './brand-management.service';
import { StaffManagementService } from './staff-management.service';
import { StaffManagementController } from './staff-management.controller';
import { Brands } from 'src/db-modules/brands.entity';
import { Fields } from 'src/db-modules/fields.entity';
import { Users } from 'src/db-modules/users.entity';
import { AuditLogs } from 'src/db-modules/audit-logs.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggingModule } from '../common/logging/logging.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Brands,
      Fields,
      Users,
      AuditLogs
    ]),
    LoggingModule
  ],
  controllers: [
    BrandManagementController,
    StaffManagementController
  ],
  providers: [
    BrandManagementService,
    StaffManagementService
  ]
})
export class BrandManagementModule {}
