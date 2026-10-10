import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import {
  SolicitudDePagina,
  TAMANO_DE_PAGINA,
  TAMANO_MAXIMO_DE_PAGINA,
} from '../services/paginacion';

export class PaginacionDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: TAMANO_MAXIMO_DE_PAGINA, default: TAMANO_DE_PAGINA })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(TAMANO_MAXIMO_DE_PAGINA)
  tamano?: number;
}

export function solicitudDePagina(consulta: PaginacionDto): SolicitudDePagina {
  return { pagina: consulta.pagina ?? 1, tamano: consulta.tamano ?? TAMANO_DE_PAGINA };
}
