import { IsOptional, IsString } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  internshipId: string;

  @IsOptional()
  @IsString()
  motivationMessage?: string;

  @IsOptional()
  @IsString()
  cvUrl?: string;
}