import { IsNotEmpty, IsString } from "class-validator";

export class BrandInfoDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    hq: string;
}