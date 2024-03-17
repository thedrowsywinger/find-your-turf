import { IsOptional, IsString } from "class-validator";

export class ListFieldFilterQueryDto {
    @IsString()
    @IsOptional()
    name: string;

    @IsString()
    @IsOptional()
    address: string;

    @IsString()
    @IsOptional()
    city: string;

    @IsString()
    @IsOptional()
    country: string;

    @IsString()
    @IsOptional()
    brandId: string;
    
}