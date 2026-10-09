import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { ESTADOS_DE_BUS_DOCUMENTADOS } from './comunes.dto';
import { PaginacionDto } from './paginacion.dto';
import { BooleanoDeConsulta, Recortar } from './transformaciones';

export class FiltrosDeBusesDto extends PaginacionDto {
  @ApiPropertyOptional({ description: 'Solo los buses de esta línea.' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  lineaId?: number;

  @ApiPropertyOptional({ description: 'Solo los buses sin línea. Tiene prioridad sobre lineaId.' })
  @IsOptional()
  @BooleanoDeConsulta()
  @IsBoolean()
  sinLinea?: boolean;

  @ApiPropertyOptional({ enum: ESTADOS_DE_BUS_DOCUMENTADOS })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  estado?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  parqueoId?: number;

  @ApiPropertyOptional({ maxLength: 15, description: 'Parte de la placa.' })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  busqueda?: string;
}

export class RegistrarBusDto {
  @ApiProperty({ maxLength: 15, example: 'TM-0100' })
  @Recortar()
  @IsString()
  @MaxLength(64)
  placa!: string;

  @ApiProperty({ minimum: 1, maximum: 300, example: 120 })
  @IsInt()
  capacidadMax!: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  parqueoId?: number;

  @ApiPropertyOptional({ type: Number, nullable: true, example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  lineaId?: number | null;
}

export class EditarBusDto {
  @ApiProperty({ minimum: 1, maximum: 300, example: 120 })
  @IsInt()
  capacidadMax!: number;
}

export class AsignarLineaDto {
  @ApiProperty({ type: Number, nullable: true, example: 1, description: 'null quita la línea.' })
  @ValidateIf((_cuerpo: object, valor: unknown) => valor !== null)
  @IsInt()
  @Min(1)
  lineaId!: number | null;
}

export class CambiarParqueoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  parqueoId!: number;
}

export class CambiarEstadoDeBusDto {
  @ApiProperty({ enum: ESTADOS_DE_BUS_DOCUMENTADOS, example: 'MANTENIMIENTO' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  estado!: string;
}

export class LineaDeBusDto {
  @ApiProperty() id!: number;
  @ApiProperty() codigo!: string;
  @ApiProperty() nombre!: string;
}

export class EstacionDeParqueoDeBusDto {
  @ApiProperty() id!: number;
  @ApiProperty() nombre!: string;
}

export class ParqueoDeBusDto {
  @ApiProperty() id!: number;
  @ApiProperty() codigo!: string;
  @ApiProperty({ type: EstacionDeParqueoDeBusDto }) estacion!: EstacionDeParqueoDeBusDto;
}

export class BusDto {
  @ApiProperty() id!: number;
  @ApiProperty() placa!: string;
  @ApiProperty() capacidadMax!: number;
  @ApiProperty({ enum: ESTADOS_DE_BUS_DOCUMENTADOS }) estado!: string;
  @ApiProperty({ type: LineaDeBusDto, nullable: true }) linea!: LineaDeBusDto | null;
  @ApiProperty({ type: ParqueoDeBusDto }) parqueo!: ParqueoDeBusDto;
}

export class PaginaDeBusesDto {
  @ApiProperty({ type: [BusDto] }) elementos!: BusDto[];
  @ApiProperty() total!: number;
  @ApiProperty() pagina!: number;
  @ApiProperty() tamano!: number;
}
