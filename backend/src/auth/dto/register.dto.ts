import {IsEmail,IsIn,IsNotEmpty,IsOptional,IsString,MinLength,} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsIn(['STUDENT', 'SUPERVISOR', 'COMPANY', 'ADMIN'])
  role: 'STUDENT' | 'SUPERVISOR' | 'COMPANY' | 'ADMIN';

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  profession?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  managerName?: string;

  @IsOptional()
  @IsString()
  managerTitle?: string;

  @IsOptional()
  @IsString()
  sector?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  /*
  Obligatoire uniquement pour la création d'un ADMIN.
   */
  @IsOptional()
  @IsString()
  adminPin?: string;
}