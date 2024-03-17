import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiResponseMessages } from 'src/common/api-response-messages';
import { Brands } from 'src/db-modules/brands.entity';
import { Fields } from 'src/db-modules/fields.entity';
import { Repository } from 'typeorm';
import { FieldInfoDto } from './dto/field-info.dto';

@Injectable()
export class FieldManagementService {

    constructor (

        @InjectRepository(Fields)
        private readonly fieldRepository: Repository<Fields>,
        @InjectRepository(Brands)
        private readonly brandRepository: Repository<Brands>    

    ) {}

    async listFieldsService(query): Promise<any> {

        let keysAllowedForFilterForFields = ['name', 'address', 'city', 'country', 'brandId'];

        for (let key in query) {
            if (!keysAllowedForFilterForFields.includes(key)) return { data: null, error: ApiResponseMessages.INVALID_QUERY_PARAMETER_PROVIDED };
        };

        if (query.brandId) {
            query.brandId = parseInt(query.brandId);
            if (isNaN(query.brandId)) return { data: null, error: ApiResponseMessages.INVALID_QUERY_PARAMETER_PROVIDED };
            let brand: Brands | undefined = await this.brandRepository.findOne({ where: { id: query.brandId } });
            if (!brand) return { data: null, error: ApiResponseMessages.INVALID_BRAND };
        };

        let allFields = [];

        if (Object.keys(query).length > 0) {
            allFields = await this.fieldRepository.find({
                where: query
            });
        } else {
            allFields = await this.fieldRepository.find();
        }

        if (allFields.length > 0) return { data: allFields, error: null };
        else return { data: null, error: ApiResponseMessages.NO_FIELDS_AVAILABLE_AT_THE_MOMENT };

    };

    async addFieldsService(body): Promise<any> {
        let brand: Brands | undefined = await this.brandRepository.findOne({ where: { id: body.brandId } });
        if (!brand) return { data: null, error: ApiResponseMessages.INVALID_BRAND };

        let fieldToBeAdded: FieldInfoDto = body;
        let newField = await this.fieldRepository.save(body);
        return { data: newField, error: null };
    }

}
