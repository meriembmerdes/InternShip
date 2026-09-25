import { IsOptional, IsString } from 'class-validator';

export class UpdateAdminProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;
}