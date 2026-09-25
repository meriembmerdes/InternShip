import { ApiProperty } from '@nestjs/swagger';
import { ReportStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateReportDto {
  @ApiProperty()
  @IsString()
  stageId: string;

  @ApiProperty()
  @IsString()
  studentId: string;

  @ApiProperty()
  @IsString()
  fileUrl: string;

  @ApiProperty({ required: false, enum: ReportStatus })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}

export class UpdateReportDto {
  @ApiProperty({ required: false, enum: ReportStatus })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  comment?: string;
}