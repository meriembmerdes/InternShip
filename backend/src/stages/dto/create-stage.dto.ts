import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateStageDto {
  @ApiProperty({
    description: 'ID de la candidature acceptée',
  })
  @IsString()
  applicationId: string;

  @ApiProperty({
    required: false,
    description: 'Date de début du stage',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    required: false,
    description: 'Date de fin du stage',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}