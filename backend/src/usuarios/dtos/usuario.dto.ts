import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { ROLES } from '../../shared/auth/rol';

const definida = (_objeto: object, valor: unknown): boolean => valor !== undefined;

/** `rol` y `contrasena` llegan como texto: el command responde el código de dominio si no cumplen. */
export class RegistrarUsuarioDto {
  @ApiProperty({ example: 'Ana López', maxLength: 150 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre!: string;

  @ApiProperty({ example: 'ana@muni.gt', maxLength: 150 })
  @IsEmail()
  @MaxLength(150)
  correo!: string;

  @ApiProperty({ enum: ROLES, example: 'OPERADOR_ESTACION' })
  @IsString()
  @MaxLength(30)
  rol!: string;

  @ApiProperty({
    maxLength: 128,
    format: 'password',
    description: 'Al menos 8 caracteres, con al menos una letra y un número.',
  })
  @IsString()
  @MaxLength(128)
  contrasena!: string;

  @ApiPropertyOptional({ description: 'Obligatoria para un operador de estación.', example: 1 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  estacionId?: number;
}

/** Solo los campos que cambian. `estacionId: null` retira la estación. */
export class EditarUsuarioDto {
  @ApiPropertyOptional({ maxLength: 150 })
  @ValidateIf(definida)
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre?: string;

  @ApiPropertyOptional({ maxLength: 150 })
  @ValidateIf(definida)
  @IsEmail()
  @MaxLength(150)
  correo?: string;

  @ApiPropertyOptional({ enum: ROLES })
  @ValidateIf(definida)
  @IsString()
  @MaxLength(30)
  rol?: string;

  @ApiPropertyOptional({ type: Number, nullable: true, example: 1 })
  @IsOptional()
  @IsInt()
  @IsPositive()
  estacionId?: number | null;
}

export class IdCreadoDto {
  @ApiProperty({ example: 12 })
  id!: number;
}
