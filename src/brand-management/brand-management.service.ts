import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiResponseMessages } from 'src/common/api-response-messages';
import { Brands } from 'src/db-modules/brands.entity';
import { Fields } from 'src/db-modules/fields.entity';
import { DataSource, Repository } from 'typeorm';
import { BrandInfoDto } from './dto/brand-info.dto';

@Injectable()
export class BrandManagementService {

    constructor(
        private dataSource: DataSource,
        @InjectRepository(Brands)
        private readonly brandRepository: Repository<Brands>,
        @InjectRepository(Fields)
        private readonly fieldRepository: Repository<Fields>
    ) { }

    async createBrandService(brandInfo, user): Promise<any> {
        brandInfo['createdBy'] = user.id;

        // Check if the brand already exists
        const existingBrand = await this.brandRepository.findOne({
            where: { name: brandInfo.name }
        });
        if (existingBrand) {
            return { data: null, error: 'Brand already exists' };
        };

        const newBrand = await this.brandRepository.save(brandInfo);
        if (newBrand) return { data: newBrand, error: null };
        else return { data: null, error: ApiResponseMessages.SYSTEM_ERROR };
    };

    async listBrandsService(): Promise<any> {
        try {
            const brands = await this.brandRepository.find({
                // relations: ['fields'],
                where: { status: 1 }
            });
            return { data: brands, error: null };
        } catch (error) {
            console.error('Error listing brands:', error);
            return { data: null, error: ApiResponseMessages.SYSTEM_ERROR };
        }
    }

    async getBrandDetailsService(brandId: number): Promise<any> {
        try {
            const brand = await this.brandRepository.findOne({
                relations: ['fields'],
                where: { id: brandId, status: 1 }
            });

            if (!brand) {
                return { data: null, error: 'Brand not found' };
            }

            return { data: brand, error: null };
        } catch (error) {
            console.error('Error getting brand details:', error);
            return { data: null, error: ApiResponseMessages.SYSTEM_ERROR };
        }
    }

    async updateBrandService(brandId: number, updateInfo: BrandInfoDto, user: any): Promise<any> {
        try {
            const brand = await this.brandRepository.findOne({
                where: { id: brandId, status: 1 }
            });

            if (!brand) {
                return { data: null, error: 'Brand not found' };
            }

            Object.assign(brand, updateInfo);
            brand.updatedBy = user.id;
            brand.updatedAt = new Date();

            const updatedBrand = await this.brandRepository.save(brand);
            return { data: updatedBrand, error: null };
        } catch (error) {
            console.error('Error updating brand:', error);
            return { data: null, error: ApiResponseMessages.SYSTEM_ERROR };
        }
    }

    async deleteBrandService(brandId: number, user: any): Promise<any> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const brand = await this.brandRepository.findOne({
                where: { id: brandId, status: 1 }
            });

            if (!brand) {
                return { data: null, error: 'Brand not found' };
            }

            // Soft delete related fields
            await queryRunner.manager.update(Fields, 
                { brandId: brandId },
                { status: 0, updatedBy: user.id }
            );

            // Soft delete the brand
            brand.status = 0;
            brand.updatedBy = user.id;
            brand.updatedAt = new Date();
            await queryRunner.manager.save(brand);

            await queryRunner.commitTransaction();
            return { data: true, error: null };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Error deleting brand:', error);
            return { data: null, error: ApiResponseMessages.SYSTEM_ERROR };
        } finally {
            await queryRunner.release();
        }
    }
}
