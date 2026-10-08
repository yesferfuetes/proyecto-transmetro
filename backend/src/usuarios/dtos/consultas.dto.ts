import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ROLES } from '../../shared/auth/rol';
import type { Rol } from '../../shared/auth/rol';
import type {
  EstacionAsignable,
  MiCuenta,
  PaginaDeUsuarios,
  UsuarioDetalle,
  UsuarioListado,
} from '../queries/impl/vistas';

export const TAMANO_DE_PAGINA = 25;
export const TAMANO_MAXIMO_DE_PAGINA = 100;

function aBooleano({ value }: { value: unknown }): unknown {
  if (value === 'true') {
    return true;
  }
  return value === 'false' ? false : value;
}

export class FiltrosDeUsuariosDto {
  @ApiPropertyOptional({ enum: ROLES })
  @IsOptional()
  @IsIn(ROLES)
  rol?: Rol;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  estacionId?: number;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @Transform(aBooleano)
  @IsBoolean()
  activo?: boolean;

  @ApiPropertyOptional({ description: 'Parte del nombre o del correo.', maxLength: 150 })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  busqueda?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina: number = 1;

  @ApiPropertyOptional({ default: TAMANO_DE_PAGINA, minimum: 1, maximum: TAMANO_MAXIMO_DE_PAGINA })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(TAMANO_MAXIMO_DE_PAGINA)
  tamano: number = TAMANO_DE_PAGINA;
}

export class EstacionAsignableDto implements EstacionAsignable {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'E01' })
  codigo!: string;

  @ApiProperty({ example: 'Centra Norte' })
  nombre!: string;
}

export class MiCuentaDto implements MiCuenta {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  nombre!: string;

  @ApiProperty()
  correo!: string;

  @ApiProperty({ enum: ROLES })
  rol!: Rol;

  @ApiProperty({ type: EstacionAsignableDto, nullable: true })
  estacion!: EstacionAsignableDto | null;
}

export class UsuarioListadoDto implements UsuarioListado {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  nombre!: string;

  @ApiProperty()
  correo!: string;

  @ApiProperty({ enum: ROLES })
  rol!: Rol;

  @ApiProperty({ type: EstacionAsignableDto, nullable: true })
  estacion!: EstacionAsignableDto | null;

  @ApiProperty()
  activo!: boolean;
}

export class PaginaDeUsuariosDto implements PaginaDeUsuarios {
  @ApiProperty({ type: [UsuarioListadoDto] })
  elementos!: UsuarioListadoDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  pagina!: number;

  @ApiProperty()
  tamano!: number;
}

export class UsuarioDetalleDto implements UsuarioDetalle {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  nombre!: string;

  @ApiProperty()
  correo!: string;

  @ApiProperty({ enum: ROLES })
  rol!: Rol;

  @ApiProperty({ type: Number, nullable: true })
  estacionId!: number | null;

  @ApiProperty()
  activo!: boolean;

  @ApiProperty({ format: 'date-time' })
  creadoEn!: Date;
}
