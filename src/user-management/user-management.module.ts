import { Module } from '@nestjs/common';
import { UserManagementController } from './user-management.controller';
import { UserManagementService } from './user-management.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../db-modules/users.entity';
import { AuditLogs } from '../db-modules/audit-logs.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users, AuditLogs]),
  ],
  controllers: [UserManagementController],
  providers: [UserManagementService],
  exports: [UserManagementService]
})
export class UserManagementModule {}
