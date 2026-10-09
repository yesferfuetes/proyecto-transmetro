import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ReferenciaDeEstacionDto } from './comunes.dto';
import { PaginacionDto } from './paginacion.dto';
import { Recortar } from './transformaciones';

export class FiltrosDeAccesosDto extends PaginacionDto {
  @ApiPropertyOptional({ description: 'Solo las estaciones del recorrido de esta línea.' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  lineaId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  estacionId?: number;

  @ApiPropertyOptional({
    maxLength: 100,
    description: 'Parte del código o del nombre de la estación.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  busqueda?: string;
}

export class RegistrarAccesoDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  estacionId!: number;

  @ApiProperty({ minLength: 1, maxLength: 10, example: 'A' })
  @Recortar()
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  codigo!: string;

  @ApiPropertyOptional({ maxLength: 100, example: 'Principal' })
  @IsOptional()
  @Recortar()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @ApiPropertyOptional({
    description: 'Primer guardia del acceso. Sin él se rechaza con ACCESO_SIN_GUARDIA.',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  guardiaId?: number;

  @ApiPropertyOptional({
    maxLength: 20,
    example: '06:00-14:00',
    description: 'Turno del primer guardia.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  turno?: string;
}

/** El código y la estación no se declaran: no cambian después del registro. */
export class EditarAccesoDto {
  @ApiProperty({ maxLength: 100, description: 'Vacío quita el nombre.' })
  @Recortar()
  @IsString()
  @MaxLength(100)
  nombre!: string;
}

export class AsignarGuardiaDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  guardiaId!: number;

  @ApiProperty({ maxLength: 20, example: '06:00-14:00' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  turno!: string;
}

export class QuitarAsignacionDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  guardiaId!: number;

  @ApiProperty({ maxLength: 20, example: '06:00-14:00' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  turno!: string;
}

export class AccesoEnListadoDto {
  @ApiProperty() id!: number;
  @ApiProperty() codigo!: string;
  @ApiProperty({ type: String, nullable: true }) nombre!: string | null;
  @ApiProperty({ description: 'Guardias distintos asignados al acceso.' }) guardias!: number;
}

export class EstacionConAccesosDto {
  @ApiProperty({ type: ReferenciaDeEstacionDto }) estacion!: ReferenciaDeEstacionDto;
  @ApiProperty({ type: [AccesoEnListadoDto] }) accesos!: AccesoEnListadoDto[];
}

export class PaginaDeAccesosDto {
  @ApiProperty({ type: [EstacionConAccesosDto] }) elementos!: EstacionConAccesosDto[];
  @ApiProperty() total!: number;
  @ApiProperty() pagina!: number;
  @ApiProperty() tamano!: number;
}

export class GuardiaDeAsignacionDto {
  @ApiProperty() id!: number;
  @ApiProperty() nombre!: string;
  @ApiProperty() dpi!: string;
}

export class AsignacionDeAccesoDto {
  @ApiProperty({ type: GuardiaDeAsignacionDto }) guardia!: GuardiaDeAsignacionDto;
  @ApiProperty({ example: '06:00-14:00' }) turno!: string;
}

export class DetalleDeAccesoDto {
  @ApiProperty() id!: number;
  @ApiProperty() codigo!: string;
  @ApiProperty({ type: String, nullable: true }) nombre!: string | null;
  @ApiProperty({ type: ReferenciaDeEstacionDto }) estacion!: ReferenciaDeEstacionDto;
  @ApiProperty({ type: [AsignacionDeAccesoDto], description: 'Por inicio de turno.' })
  asignaciones!: AsignacionDeAccesoDto[];
}

export class LineaDeAccesosDto {
  @ApiProperty() id!: number;
  @ApiProperty() codigo!: string;
  @ApiProperty() nombre!: string;
}

export class EstacionDeLineaConAccesosDto extends ReferenciaDeEstacionDto {
  @ApiProperty({ description: 'Lugar en el recorrido, desde 1.' }) posicion!: number;
  @ApiProperty({ type: [AccesoEnListadoDto] }) accesos!: AccesoEnListadoDto[];
  @ApiProperty() sinAccesos!: boolean;
}

export class AccesosDeLineaDto {
  @ApiProperty({ type: LineaDeAccesosDto }) linea!: LineaDeAccesosDto;
  @ApiProperty({ type: [EstacionDeLineaConAccesosDto], description: 'En orden de recorrido.' })
  estaciones!: EstacionDeLineaConAccesosDto[];
}
