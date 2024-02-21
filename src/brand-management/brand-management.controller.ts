import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { BrandManagementService } from './brand-management.service';
import { ApiResponseMessages } from 'src/common/api-response-messages';

@Controller('brand-management')
export class BrandManagementController {

    constructor(private readonly brandManagementService: BrandManagementService) { }

    @Post('create')
    async createBrandController(@Body() body): Promise<any> {
        const { data, error } = await this.brandManagementService.createBrandService(body.brandInfo, body.fieldInfo);
        if (error) {
            return (
                HttpStatus.NOT_FOUND,
                false,
                error,
                data,
                [error]
            )
        } else {
            return (
                HttpStatus.OK,
                true,
                ApiResponseMessages.SUCCESS,
                data,
                error
            );
        };
    };

}
