import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiResponseMessages } from 'src/common/api-response-messages';
import { Brands } from 'src/db-modules/brands.entity';
import { Fields } from 'src/db-modules/fields.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateBrandDto } from './dto/brand-info.dto';
import { Users } from '../db-modules/users.entity';

@Injectable()
export class BrandManagementService {

    constructor(
        private dataSource: DataSource,
        @InjectRepository(Brands)
        private readonly brandRepository: Repository<Brands>,
        @InjectRepository(Fields)
        private readonly fieldRepository: Repository<Fields>,
        @InjectRepository(Users)
        private readonly userRepository: Repository<Users>,
    ) { }

    /**
     * Creates a brand + its initial fields, all in one transaction.
     */
    async createBrandService(
        dto: CreateBrandDto,
        user: Users,
    ): Promise<{ data: Brands; error: string | null }> {
        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {

            const brandEntity = qr.manager.create(Brands, {
                name: dto.name,
                description: dto.description ?? null,
                contactEmail: dto.contactEmail,
                contactPhone: dto.contactPhone,
                fullAddress: dto.fullAddress,
                street: dto.street,
                city: dto.city,
                state: dto.state,
                postalCode: dto.postalCode,
                country: dto.country,
                status: 0,
                createdBy: user.id,
            });
            const savedBrand = await qr.manager.save(Brands, brandEntity);

            // // 3) Map each FieldInfoDto to a Fields entity, linking to savedBrand.id
            // const fieldsToSave = dto.fields.map((f) =>
            //     // @ts-ignore
            //     qr.manager.create(Fields, {
            //         name: f.name,
            //         address: f.address,
            //         city: f.city,
            //         country: f.country,
            //         description: f.description,
            //         sportType: f.sportType,
            //         brandId: savedBrand.id,
            //         createdBy: user.id,
            //     }),
            // );
            // const savedFields = await qr.manager.save(Fields, fieldsToSave);

            // 4) Attach the newly created fields onto the returned brand object
            // ; (savedBrand as any).fields = savedFields;

            // 5) Commit & return
            await qr.commitTransaction();
            return { data: savedBrand, error: null };
        } catch (err: any) {
            await qr.rollbackTransaction();
            console.error('Error in createBrandService:', err);
            return {
                data: null,
                error: err.message || ApiResponseMessages.SYSTEM_ERROR,
            };
        } finally {
            await qr.release();
        }
    };

    async getBrandDetailsService(brandId: string): Promise<any> {
        try {
            const brand = await this.brandRepository.findOne({
                relations: ['fields'],
                where: { code: brandId, status: 1 }
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

    async updateBrandService(brandId: number, updateInfo: CreateBrandDto, user: any): Promise<any> {
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

    async listBrandsService(): Promise<any> {
        try {

            let allBrands = {};

            const activeBrands = await this.brandRepository.find({
                where: { status: 1 },
                // relations: ['fields'],
            });
            const inactiveBrands = await this.brandRepository.find({
                where: { status: 0 },
                // relations: ['fields'],
            });
            allBrands = {
                activeBrands: activeBrands,
                inactiveBrands: inactiveBrands,
            };
            return { data: allBrands, error: null };
        } catch (error) {
            console.error('Error listing brands:', error);
            return { data: null, error: ApiResponseMessages.SYSTEM_ERROR };
        }
    }

    /**
     * TODO: Serialize the response
     */
    async approveABrandService(brandId: number, user: any): Promise<any> {
        const brand = await this.brandRepository.findOne({
            where: { id: brandId }
        });
        if (!brand) return { data: null, error: ApiResponseMessages.BRAND_NOT_FOUND };
        
        if (brand.status === 1) return { data: null, error: ApiResponseMessages.BRAND_ALREADY_APPROVED };

        brand.status = 1;
        brand.updatedBy = user.id;
        brand.updatedAt = new Date();
        const updatedBrand = await this.brandRepository.save(brand);
        if (!updatedBrand) return { data: null, error: ApiResponseMessages.BRAND_UPDATE_FAILED };

        return { data: updatedBrand, error: null };
    }
}
