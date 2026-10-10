import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { TIPOS_DE_REPORTE } from '../services/tipos-de-reporte';
import { PaginacionDto } from './paginacion.dto';

export class FiltrosDeBitacoraDto extends PaginacionDto {
  @ApiPropertyOptional({ description: 'Solo las consultas de este usuario.' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  usuarioId?: number;

  @ApiPropertyOptional({ enum: [...TIPOS_DE_REPORTE] })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tipo?: string;

  @ApiPropertyOptional({ example: '2026-10-01', description: 'Día de Guatemala, inclusivo.' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  desde?: string;

  @ApiPropertyOptional({ example: '2026-10-31', description: 'Día de Guatemala, inclusivo.' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  hasta?: string;
}
