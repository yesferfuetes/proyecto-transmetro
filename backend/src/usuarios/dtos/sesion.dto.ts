import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class IniciarSesionDto {
  @ApiProperty({ example: 'admin@transmetro.test', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  correo!: string;

  @ApiProperty({ maxLength: 128, format: 'password' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  contrasena!: string;
}

export class TokenDeSesionDto {
  @ApiProperty({ description: 'Token de sesión para el encabezado Authorization: Bearer.' })
  token!: string;

  @ApiProperty({ example: '2026-10-07T22:00:00.000Z', format: 'date-time' })
  expiraEn!: string;
}
