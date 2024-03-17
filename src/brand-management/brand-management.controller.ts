import { Body, Controller, Get, HttpStatus, Post } from '@nestjs/common';
import { BrandManagementService } from './brand-management.service';
import { ApiResponseMessages } from 'src/common/api-response-messages';
import { BaseSerializer } from 'src/app.serializer';

@Controller('brand')
export class BrandManagementController {

    constructor(private readonly brandManagementService: BrandManagementService) { }

    @Post('create')
    async createBrandController(@Body() body): Promise<BaseSerializer> {
        const { data, error } = await this.brandManagementService.createBrandService(body.brandInfo, body.fieldInfo);
        if (error) {
            return new BaseSerializer(
                HttpStatus.NOT_FOUND,
                false,
                error,
                data,
                [error]
            )
        } else {
            return new BaseSerializer(
                HttpStatus.OK,
                true,
                ApiResponseMessages.SUCCESS,
                data,
                error
            );
        };
    };

    

}
