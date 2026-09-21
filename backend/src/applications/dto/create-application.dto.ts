import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateApplicationDto {
    @ApiProperty()
    @IsString()
    internshipId:string;
    @ApiProperty({required:false})
    @IsOptional()
    @IsString()
    motivationMessage?:string;
    @ApiProperty({required:false})
    @IsOptional()
    @IsString()
    cvUrl?:string;
}