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

    async createBrandService(brandInfo, fieldInfo): Promise<any> {

        let newBrand = null;
        let newField = null;

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            newBrand = await queryRunner.manager.save(Brands, brandInfo);
            fieldInfo.brandId = newBrand.id; 
            newField = await queryRunner.manager.save(Fields, fieldInfo);
            await queryRunner.commitTransaction();
        } catch (error) {
            console.log(error)
            await queryRunner.rollbackTransaction();
        };

        if (newBrand && newField) {
            return { data: newField, error: null };
        } else {
            return { data: null, error: ApiResponseMessages.SYSTEM_ERROR };
        }
    };

}
