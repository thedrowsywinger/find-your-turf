import { Module } from '@nestjs/common';
import { BrandManagementController } from './brand-management.controller';
import { BrandManagementService } from './brand-management.service';
import { Brands } from 'src/db-modules/brands.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fields } from 'src/db-modules/fields.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [
        Brands,
        Fields
      ]
    )
  ], 
  controllers: [BrandManagementController],
  providers: [BrandManagementService]
})
export class BrandManagementModule {}
