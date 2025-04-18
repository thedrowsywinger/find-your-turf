import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class BrandInfoDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsString()
    @IsNotEmpty()
    @IsEmail()
    contactEmail: string;

    @IsString()
    @IsNotEmpty()
    contactPhone: string;

    @IsString()
    @IsNotEmpty()
    fullAddress: string;
}