import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { FieldManagementService } from './field-management.service';
import { BaseSerializer } from 'src/app.serializer';
import { ApiResponseMessages } from 'src/common/api-response-messages';
import { ListFieldFilterQueryDto } from './dto/list-field-query.dto';

@Controller('field')
export class FieldManagementController {

    constructor( private readonly fieldManagementService: FieldManagementService ) {}

    @Get('list')
    async listFieldsController(@Query() query: ListFieldFilterQueryDto): Promise<any> {
        const { data, error } = await this.fieldManagementService.listFieldsService(query);
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
