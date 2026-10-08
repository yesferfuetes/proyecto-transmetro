import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { ESTADOS_DOCUMENTADOS, ReferenciaDeMunicipalidadDto } from './comunes.dto';
import { PaginacionDto } from './paginacion.dto';
import { BooleanoDeConsulta, presenteSiViene, Recortar } from './transformaciones';

const NUMERO_FINITO = { allowNaN: false, allowInfinity: false };

export class FiltrosDeEstacionesDto extends PaginacionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  municipalidadId?: number;

  @ApiPropertyOptional({ description: 'Solo las estaciones del recorrido de esta línea.' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  lineaId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @BooleanoDeConsulta()
  @IsBoolean()
  tieneParqueo?: boolean;

  @ApiPropertyOptional({ maxLength: 100, description: 'Parte del código o del nombre.' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  busqueda?: string;
}

export class RegistrarEstacionDto {
  @ApiProperty({ maxLength: 10, example: 'E100' })
  @Recortar()
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  codigo!: string;

  @ApiProperty({ maxLength: 150, example: 'Plaza Barrios' })
  @Recortar()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  municipalidadId!: number;

  @ApiProperty()
  @IsBoolean()
  tieneParqueo!: boolean;

  @ApiPropertyOptional({ type: Number, nullable: true, example: 14.6349 })
  @IsOptional()
  @IsNumber(NUMERO_FINITO)
  latitud?: number | null;

  @ApiPropertyOptional({ type: Number, nullable: true, example: -90.5069 })
  @IsOptional()
  @IsNumber(NUMERO_FINITO)
  longitud?: number | null;
}

/** El código no se declara: no se cambia después del registro. */
export class EditarEstacionDto {
  @ApiPropertyOptional({ maxLength: 150 })
  @ValidateIf(presenteSiViene)
  @Recortar()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre?: string;

  @ApiPropertyOptional()
  @ValidateIf(presenteSiViene)
  @IsInt()
  @Min(1)
  municipalidadId?: number;

  @ApiPropertyOptional()
  @ValidateIf(presenteSiViene)
  @IsBoolean()
  tieneParqueo?: boolean;

  @ApiPropertyOptional({
    type: Number,
    nullable: true,
    description: 'Con longitud en null, quita las coordenadas.',
  })
  @IsOptional()
  @IsNumber(NUMERO_FINITO)
  latitud?: number | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  @IsOptional()
  @IsNumber(NUMERO_FINITO)
  longitud?: number | null;
}

export class LineaDeReferenciaDto {
  @ApiProperty() id!: number;
  @ApiProperty() codigo!: string;
}

export class EstacionEnListadoDto {
  @ApiProperty() id!: number;
  @ApiProperty() codigo!: string;
  @ApiProperty() nombre!: string;
  @ApiProperty({ type: ReferenciaDeMunicipalidadDto }) municipalidad!: ReferenciaDeMunicipalidadDto;
  @ApiProperty() tieneParqueo!: boolean;
  @ApiProperty({ type: [LineaDeReferenciaDto] }) lineas!: LineaDeReferenciaDto[];
  @ApiProperty({ description: 'No está en el recorrido de ninguna línea.' }) sinLinea!: boolean;
}

export class PaginaDeEstacionesDto {
  @ApiProperty({ type: [EstacionEnListadoDto] }) elementos!: EstacionEnListadoDto[];
  @ApiProperty() total!: number;
  @ApiProperty() pagina!: number;
  @ApiProperty() tamano!: number;
}

export class OpcionDeEstacionDto {
  @ApiProperty() id!: number;
  @ApiProperty() codigo!: string;
  @ApiProperty() nombre!: string;
}

export class LineaDeEstacionDto {
  @ApiProperty() id!: number;
  @ApiProperty() codigo!: string;
  @ApiProperty() nombre!: string;
  @ApiProperty({ enum: ESTADOS_DOCUMENTADOS }) estado!: string;
  @ApiProperty({ description: 'Posición de la estación en el recorrido.' }) posicion!: number;
}

export class DetalleDeEstacionDto {
  @ApiProperty() id!: number;
  @ApiProperty() codigo!: string;
  @ApiProperty() nombre!: string;
  @ApiProperty({ type: ReferenciaDeMunicipalidadDto }) municipalidad!: ReferenciaDeMunicipalidadDto;
  @ApiProperty() tieneParqueo!: boolean;
  @ApiProperty({ type: Number, nullable: true }) latitud!: number | null;
  @ApiProperty({ type: Number, nullable: true }) longitud!: number | null;
  @ApiProperty({ type: [LineaDeEstacionDto] }) lineas!: LineaDeEstacionDto[];
}
