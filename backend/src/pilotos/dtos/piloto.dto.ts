import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { PaginacionDto } from './paginacion.dto';
import { BooleanoDeConsulta, Recortar } from './transformaciones';

export class IdCreadoDto {
  @ApiProperty({ example: 1 })
  id!: number;
}

export class FiltrosDePilotosDto extends PaginacionDto {
  @ApiPropertyOptional({ description: 'Solo los pilotos de los buses de esta línea.' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  lineaId?: number;

  @ApiPropertyOptional({ description: 'Solo los pilotos de este bus.' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  busId?: number;

  @ApiPropertyOptional({
    description: 'Solo los pilotos sin bus. Tiene prioridad sobre los demás.',
  })
  @IsOptional()
  @BooleanoDeConsulta()
  @IsBoolean()
  sinBus?: boolean;

  @ApiPropertyOptional({
    maxLength: 100,
    description: 'Parte del nombre; con vista completa, también del DPI.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  busqueda?: string;
}

/**
 * Los valores con código de dominio (nombre, DPI, dirección, historial, teléfono y correo) se
 * validan en el comando; aquí solo el tipo y el largo máximo.
 */
export class DatosDePilotoDto {
  @ApiProperty({ maxLength: 150, example: 'Carlos Pérez' })
  @Recortar()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  nombre?: string;

  @ApiProperty({ example: '1234 56789 0101', description: '13 dígitos.' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  dpi?: string;

  @ApiProperty({ maxLength: 250, example: 'Zona 1, Ciudad de Guatemala' })
  @IsOptional()
  @IsString()
  @MaxLength(250)
  direccionResidencia?: string;

  @ApiProperty({ example: '5555-1234', description: '8 dígitos.' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefono?: string;

  @ApiPropertyOptional({ maxLength: 150, example: 'carlos@correo.com' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  correo?: string;

  @ApiProperty({ maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  historialEducativo?: string;
}

export class RegistrarPilotoDto extends DatosDePilotoDto {
  @ApiPropertyOptional({ type: Number, nullable: true, example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  busId?: number | null;
}

export class AsignarBusDto {
  @ApiProperty({ type: Number, nullable: true, example: 1, description: 'null quita el bus.' })
  @ValidateIf((_cuerpo: object, valor: unknown) => valor !== null)
  @IsInt()
  @Min(1)
  busId!: number | null;
}

export class BusDePilotoDto {
  @ApiProperty() id!: number;
  @ApiProperty() placa!: string;
  @ApiProperty({ enum: ['ACTIVO', 'MANTENIMIENTO', 'BAJA'] }) estado!: string;
}

export class LineaDePilotoDto {
  @ApiProperty() id!: number;
  @ApiProperty() codigo!: string;
  @ApiProperty() nombre!: string;
}

/** Vista del operador: nombre, bus, línea y teléfono. */
export class PilotoReducidoDto {
  @ApiProperty() id!: number;
  @ApiProperty() nombre!: string;
  @ApiProperty({ type: String, nullable: true }) telefono!: string | null;
  @ApiProperty({ type: BusDePilotoDto, nullable: true }) bus!: BusDePilotoDto | null;
  @ApiProperty({ type: LineaDePilotoDto, nullable: true }) linea!: LineaDePilotoDto | null;
  @ApiProperty({ description: 'El bus del piloto está de baja.' }) busDeBaja!: boolean;
}

/** Listado de supervisor y administrador: lo del operador más el DPI. */
export class PilotoEnListadoCompletoDto extends PilotoReducidoDto {
  @ApiProperty() dpi!: string;
}

/** Expediente completo de supervisor y administrador. */
export class PilotoCompletoDto extends PilotoEnListadoCompletoDto {
  @ApiProperty({ type: String, nullable: true }) direccionResidencia!: string | null;
  @ApiProperty({ type: String, nullable: true }) correo!: string | null;
  @ApiProperty({ type: String, nullable: true }) historialEducativo!: string | null;
}

export class PaginaDePilotosDto {
  @ApiProperty({
    description: 'Reducidos para el operador; con DPI para supervisor y administrador.',
    oneOf: [
      { $ref: '#/components/schemas/PilotoReducidoDto' },
      { $ref: '#/components/schemas/PilotoEnListadoCompletoDto' },
    ],
    isArray: true,
  })
  elementos!: (PilotoReducidoDto | PilotoEnListadoCompletoDto)[];
  @ApiProperty() total!: number;
  @ApiProperty() pagina!: number;
  @ApiProperty() tamano!: number;
}

export class BusOpcionDto {
  @ApiProperty() id!: number;
  @ApiProperty() placa!: string;
  @ApiProperty({ type: LineaDePilotoDto, nullable: true }) linea!: LineaDePilotoDto | null;
  @ApiProperty() pilotos!: number;
}

export class OpcionesDePilotosDto {
  @ApiProperty({ type: [BusOpcionDto] }) buses!: BusOpcionDto[];
  @ApiProperty({ type: [LineaDePilotoDto] }) lineas!: LineaDePilotoDto[];
}
