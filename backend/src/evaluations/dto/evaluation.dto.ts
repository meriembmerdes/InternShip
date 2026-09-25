import { ApiProperty } from '@nestjs/swagger';
import { EvaluationStatus } from '@prisma/client';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateEvaluationDto {
  @ApiProperty()
  @IsString()
  stageId: string;

  @ApiProperty()
  @IsString()
  authorId: string;

  @ApiProperty()
  @IsObject()
  criteria: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(EvaluationStatus)
  status?: EvaluationStatus;
}

export class UpdateEvaluationDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  criteria?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(EvaluationStatus)
  status?: EvaluationStatus;
}