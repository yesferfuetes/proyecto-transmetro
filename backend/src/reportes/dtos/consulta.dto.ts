import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { TIPOS_DE_REPORTE } from '../services/tipos-de-reporte';
import { PaginacionDto } from './paginacion.dto';

const TIPOS_DOCUMENTADOS = [...TIPOS_DE_REPORTE];

export class RegistrarConsultaDto {
  @ApiProperty({ enum: TIPOS_DOCUMENTADOS, example: 'LINEAS' })
  @IsString()
  @MaxLength(50)
  tipo!: string;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  lineaId?: number;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  estacionId?: number;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  municipalidadId?: number;
}

export class IdDeConsultaDto {
  @ApiProperty({ example: 1 })
  id!: number;
}

export class PaginaDeReporteDto extends PaginacionDto {}
