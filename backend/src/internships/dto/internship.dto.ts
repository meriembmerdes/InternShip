import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { InternshipStatus } from '@prisma/client';

export class CreateInternshipDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  domain: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  numberOfPlaces?: number;

  @IsOptional()
  @IsEnum(InternshipStatus)
  status?: InternshipStatus;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  supervisorId?: string;

  @IsOptional()
  @IsString()
  type?: string;
}

export class UpdateInternshipDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  numberOfPlaces?: number;

  @IsOptional()
  @IsEnum(InternshipStatus)
  status?: InternshipStatus;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  supervisorId?: string;

  @IsOptional()
  @IsString()
  type?: string;
}

export class InternshipQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(InternshipStatus)
  status?: InternshipStatus;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}