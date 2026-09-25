import { ApiProperty } from '@nestjs/swagger';
import { StageStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateStageDto {
  @ApiProperty({ required: false, enum: StageStatus })
  @IsOptional()
  @IsEnum(StageStatus)
  status?: StageStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progression?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  supervisorId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  companyId?: string;
}