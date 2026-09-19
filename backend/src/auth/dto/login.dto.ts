import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'student@internflow.test' })
  @IsEmail({}, { message: 'L’email est invalide.' })
  email: string;

  @ApiProperty({ example: 'MotDePasse123!' })
  @IsString({ message: 'Le mot de passe est requis.' })
  password: string;
}
