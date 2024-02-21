import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class FieldInfoDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsNotEmpty()
    country: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsInt()
    @IsNotEmpty()
    brandId: number;
    
}