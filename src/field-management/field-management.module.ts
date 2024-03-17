import { Module } from '@nestjs/common';
import { FieldManagementService } from './field-management.service';
import { FieldManagementController } from './field-management.controller';
import { Fields } from 'src/db-modules/fields.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brands } from 'src/db-modules/brands.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        Fields,
        Brands
      ]
    )
  ], 
  providers: [FieldManagementService],
  controllers: [FieldManagementController]
})
export class FieldManagementModule {}
