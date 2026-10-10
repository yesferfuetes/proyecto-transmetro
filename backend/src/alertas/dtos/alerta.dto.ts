import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';
import { ESTADOS_DE_ALERTA, TIPOS_DE_ALERTA } from '../services/tipos-de-alerta';
import { PaginacionDto } from './paginacion.dto';

export class FiltrosDeAlertasDto extends PaginacionDto {
  @ApiPropertyOptional({ enum: ESTADOS_DE_ALERTA })
  @IsOptional()
  @IsIn(ESTADOS_DE_ALERTA)
  estado?: (typeof ESTADOS_DE_ALERTA)[number];

  @ApiPropertyOptional({ enum: TIPOS_DE_ALERTA })
  @IsOptional()
  @IsIn(TIPOS_DE_ALERTA)
  tipo?: (typeof TIPOS_DE_ALERTA)[number];

  @ApiPropertyOptional({ description: 'Se ignora para el operador: ve solo su estación.' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  estacionId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  lineaId?: number;
}

export class FiltroDeEstacionDto {
  @ApiPropertyOptional({ description: 'Se ignora para el operador: cuenta solo su estación.' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  estacionId?: number;
}

export class ReferenciaDto {
  @ApiProperty() id!: number;
  @ApiProperty() codigo!: string;
  @ApiProperty() nombre!: string;
}

export class BusDeAlertaDto {
  @ApiProperty() id!: number;
  @ApiProperty() placa!: string;
}

export class AtendidaPorDto {
  @ApiProperty() id!: number;
  @ApiProperty() nombre!: string;
}

export class AlertaDto {
  @ApiProperty() id!: number;
  @ApiProperty({ enum: TIPOS_DE_ALERTA }) tipo!: string;
  @ApiProperty({ description: 'Texto de la regla para el tipo de alerta.' }) aviso!: string;
  @ApiProperty({ example: 150 }) porcentaje!: number;
  @ApiProperty({ description: 'ISO 8601.' }) fechaHora!: string;
  @ApiProperty() atendida!: boolean;
  @ApiProperty({ type: ReferenciaDto }) estacion!: ReferenciaDto;
  @ApiProperty({ type: BusDeAlertaDto }) bus!: BusDeAlertaDto;
  @ApiProperty({ type: ReferenciaDto, nullable: true }) linea!: ReferenciaDto | null;
  @ApiProperty({ type: AtendidaPorDto, nullable: true }) atendidaPor!: AtendidaPorDto | null;
}

export class PaginaDeAlertasDto {
  @ApiProperty({ type: [AlertaDto] }) elementos!: AlertaDto[];
  @ApiProperty() total!: number;
  @ApiProperty() pagina!: number;
  @ApiProperty() tamano!: number;
}

export class HuellaDeAlertasDto {
  @ApiProperty() pendientes!: number;
  @ApiProperty() atendidas!: number;
  @ApiProperty({ description: 'Id de la alerta más reciente; 0 si no hay ninguna.' })
  ultimaId!: number;
}

export class OpcionesDeAlertasDto {
  @ApiProperty({ type: [ReferenciaDto] }) estaciones!: ReferenciaDto[];
  @ApiProperty({ type: [ReferenciaDto] }) lineas!: ReferenciaDto[];
}
