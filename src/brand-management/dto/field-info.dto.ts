import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsInt, IsNotEmpty, IsString } from "class-validator";
import { SportType } from "../../db-modules/fields.entity";

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

    @ApiProperty({ enum: SportType })
    @IsEnum(SportType)
    sportType: string;
    
}