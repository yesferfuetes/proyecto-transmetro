import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ReferenciaDeEstacionDto } from './comunes.dto';
import { PaginacionDto } from './paginacion.dto';
import { Recortar } from './transformaciones';

export class FiltrosDeGuardiasDto extends PaginacionDto {
  @ApiPropertyOptional({ maxLength: 100, description: 'Parte del nombre o del DPI.' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  busqueda?: string;
}

/** El formato del DPI y del teléfono se valida en el comando, con su código de error. */
export class GuardiaDto {
  @ApiProperty({ minLength: 1, maxLength: 150, example: 'Carlos Pérez' })
  @Recortar()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nombre!: string;

  @ApiProperty({ maxLength: 20, example: '1234 56789 0101', description: '13 dígitos.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  dpi!: string;

  @ApiPropertyOptional({ maxLength: 20, example: '5555-1234', description: '8 dígitos.' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefono?: string;
}

export class GuardiaEnListadoDto {
  @ApiProperty() id!: number;
  @ApiProperty() nombre!: string;
  @ApiProperty() dpi!: string;
  @ApiProperty({ type: String, nullable: true }) telefono!: string | null;
  @ApiProperty() asignaciones!: number;
  @ApiProperty({ description: 'No cubre ningún acceso.' }) sinAsignacion!: boolean;
}

export class PaginaDeGuardiasDto {
  @ApiProperty({ type: [GuardiaEnListadoDto] }) elementos!: GuardiaEnListadoDto[];
  @ApiProperty() total!: number;
  @ApiProperty() pagina!: number;
  @ApiProperty() tamano!: number;
}

export class OpcionDeGuardiaDto {
  @ApiProperty() id!: number;
  @ApiProperty() nombre!: string;
  @ApiProperty() dpi!: string;
}

export class AccesoDeReferenciaDto {
  @ApiProperty() id!: number;
  @ApiProperty() codigo!: string;
}

export class AsignacionDeGuardiaDto {
  @ApiProperty({ type: AccesoDeReferenciaDto }) acceso!: AccesoDeReferenciaDto;
  @ApiProperty({ type: ReferenciaDeEstacionDto }) estacion!: ReferenciaDeEstacionDto;
  @ApiProperty({ example: '06:00-14:00' }) turno!: string;
}

export class DetalleDeGuardiaDto {
  @ApiProperty() id!: number;
  @ApiProperty() nombre!: string;
  @ApiProperty() dpi!: string;
  @ApiProperty({ type: String, nullable: true }) telefono!: string | null;
  @ApiProperty({ type: [AsignacionDeGuardiaDto] }) asignaciones!: AsignacionDeGuardiaDto[];
}
