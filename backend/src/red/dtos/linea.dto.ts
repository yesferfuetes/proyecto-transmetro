import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { ESTADOS_DOCUMENTADOS, ReferenciaDeMunicipalidadDto } from './comunes.dto';
import { PaginacionDto } from './paginacion.dto';
import { presenteSiViene, Recortar } from './transformaciones';

export const MAXIMO_DE_PARADAS = 200;

export class FiltrosDeLineasDto extends PaginacionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  municipalidadId?: number;

  @ApiPropertyOptional({ enum: ESTADOS_DOCUMENTADOS })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  estado?: string;

  @ApiPropertyOptional({ description: 'Solo las líneas que pasan por esta estación.' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  estacionId?: number;
}

export class RegistrarLineaDto {
  @ApiProperty({ maxLength: 10, example: 'L20' })
  @Recortar()
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  codigo!: string;

  @ApiProperty({ maxLength: 150, example: 'Línea 20' })
  @Recortar()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre!: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  municipalidadId!: number;

  @ApiProperty({ enum: ESTADOS_DOCUMENTADOS, example: 'EN_CONSTRUCCION' })
  @IsString()
  @MaxLength(30)
  estado!: string;
}

export class EditarLineaDto {
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
}

export class CambiarEstadoDeLineaDto {
  @ApiProperty({ enum: ESTADOS_DOCUMENTADOS, example: 'ACTIVA' })
  @IsString()
  @MaxLength(30)
  estado!: string;
}

export class ParadaDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  estacionId!: number;

  @ApiPropertyOptional({
    type: Number,
    nullable: true,
    example: 1.2,
    description: 'Kilómetros hasta la siguiente estación; en la última se descarta.',
  })
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  distanciaSiguienteKm?: number | null;
}

export class DefinirRecorridoDto {
  @ApiProperty({ type: [ParadaDto], maxItems: MAXIMO_DE_PARADAS })
  @IsArray()
  @ArrayMaxSize(MAXIMO_DE_PARADAS)
  @ValidateNested({ each: true })
  @Type(() => ParadaDto)
  paradas!: ParadaDto[];
}

export class LineaEnListadoDto {
  @ApiProperty() id!: number;
  @ApiProperty() codigo!: string;
  @ApiProperty() nombre!: string;
  @ApiProperty({ type: ReferenciaDeMunicipalidadDto }) municipalidad!: ReferenciaDeMunicipalidadDto;
  @ApiProperty({ enum: ESTADOS_DOCUMENTADOS }) estado!: string;
  @ApiProperty() numeroDeEstaciones!: number;
  @ApiProperty({ type: Number, nullable: true }) longitudKm!: number | null;
}

export class PaginaDeLineasDto {
  @ApiProperty({ type: [LineaEnListadoDto] }) elementos!: LineaEnListadoDto[];
  @ApiProperty() total!: number;
  @ApiProperty() pagina!: number;
  @ApiProperty() tamano!: number;
}

export class EstacionDeParadaDto {
  @ApiProperty() id!: number;
  @ApiProperty() codigo!: string;
  @ApiProperty() nombre!: string;
  @ApiProperty() municipalidadNombre!: string;
}

export class ParadaDelRecorridoDto {
  @ApiProperty() posicion!: number;
  @ApiProperty({ type: EstacionDeParadaDto }) estacion!: EstacionDeParadaDto;
  @ApiProperty({ type: Number, nullable: true }) distanciaSiguienteKm!: number | null;
  @ApiProperty() distanciaAcumuladaKm!: number;
}

export class DetalleDeLineaDto {
  @ApiProperty() id!: number;
  @ApiProperty() codigo!: string;
  @ApiProperty() nombre!: string;
  @ApiProperty({ type: ReferenciaDeMunicipalidadDto }) municipalidad!: ReferenciaDeMunicipalidadDto;
  @ApiProperty({ enum: ESTADOS_DOCUMENTADOS }) estado!: string;
  @ApiProperty({ type: Number, nullable: true }) longitudKm!: number | null;
  @ApiProperty({ format: 'date-time' }) creadoEn!: string;
  @ApiProperty({ type: [ParadaDelRecorridoDto] }) recorrido!: ParadaDelRecorridoDto[];
}
