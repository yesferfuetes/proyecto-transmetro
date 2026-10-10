import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TIPOS_DE_REPORTE } from '../services/tipos-de-reporte';

const TIPOS = [...TIPOS_DE_REPORTE];
const ESTADOS_DE_LINEA = ['ACTIVA', 'INACTIVA', 'EN_CONSTRUCCION'];
const ESTADOS_DE_BUS = ['ACTIVO', 'MANTENIMIENTO', 'BAJA'];
const ESTADOS_DE_FLOTA = ['completa', 'insuficiente', 'excedida'];

export class LineaBasicaDto {
  @ApiProperty() id!: number;
  @ApiProperty() codigo!: string;
  @ApiProperty() nombre!: string;
}

export class MunicipalidadBasicaDto {
  @ApiProperty() id!: number;
  @ApiProperty() nombre!: string;
}

export class FiltrosConNombresDto {
  @ApiPropertyOptional({ type: LineaBasicaDto }) linea?: LineaBasicaDto;
  @ApiPropertyOptional({ type: LineaBasicaDto }) estacion?: LineaBasicaDto;
  @ApiPropertyOptional({ type: MunicipalidadBasicaDto }) municipalidad?: MunicipalidadBasicaDto;
}

export class ConsultaDeReporteDto {
  @ApiProperty() id!: number;
  @ApiProperty({ enum: TIPOS }) tipo!: string;
  @ApiProperty({ type: FiltrosConNombresDto }) filtros!: FiltrosConNombresDto;
  @ApiProperty({ description: 'Fecha y hora de generación.' }) fechaHora!: Date;
}

class PaginaBaseDto {
  @ApiProperty() total!: number;
  @ApiProperty() pagina!: number;
  @ApiProperty() tamano!: number;
  @ApiProperty({ type: ConsultaDeReporteDto }) consulta!: ConsultaDeReporteDto;
}

export class FilaDeEstacionDto {
  @ApiProperty() id!: number;
  @ApiProperty() codigo!: string;
  @ApiProperty() nombre!: string;
  @ApiProperty({ type: MunicipalidadBasicaDto }) municipalidad!: MunicipalidadBasicaDto;
  @ApiProperty({ type: [LineaBasicaDto] }) lineas!: LineaBasicaDto[];
  @ApiProperty() tieneParqueo!: boolean;
}

export class ReporteDeEstacionesDto extends PaginaBaseDto {
  @ApiProperty({ type: [FilaDeEstacionDto] }) elementos!: FilaDeEstacionDto[];
}

export class FilaDeLineaDto {
  @ApiProperty() id!: number;
  @ApiProperty() codigo!: string;
  @ApiProperty() nombre!: string;
  @ApiProperty({ type: MunicipalidadBasicaDto }) municipalidad!: MunicipalidadBasicaDto;
  @ApiProperty({ enum: ESTADOS_DE_LINEA }) estado!: string;
  @ApiProperty() estaciones!: number;
  @ApiProperty({ type: Number, nullable: true }) longitudKm!: number | null;
  @ApiProperty() buses!: number;
  @ApiProperty() minimo!: number;
  @ApiProperty() maximo!: number;
  @ApiProperty({ enum: ESTADOS_DE_FLOTA }) estadoDeFlota!: string;
}

export class ReporteDeLineasDto extends PaginaBaseDto {
  @ApiProperty({ type: [FilaDeLineaDto] }) elementos!: FilaDeLineaDto[];
}

export class ParqueoDeBusDto {
  @ApiProperty() id!: number;
  @ApiProperty() codigo!: string;
  @ApiProperty() estacion!: { id: number; nombre: string };
}

export class FilaDeBusDto {
  @ApiProperty() id!: number;
  @ApiProperty() placa!: string;
  @ApiProperty() capacidadMax!: number;
  @ApiProperty({ enum: ESTADOS_DE_BUS }) estado!: string;
  @ApiProperty({ type: LineaBasicaDto, nullable: true }) linea!: LineaBasicaDto | null;
  @ApiProperty({ type: ParqueoDeBusDto }) parqueo!: ParqueoDeBusDto;
}

export class GrupoDeBusesDto {
  @ApiProperty({ type: LineaBasicaDto, nullable: true }) linea!: LineaBasicaDto | null;
  @ApiProperty() buses!: number;
}

export class ReporteDeBusesDto extends PaginaBaseDto {
  @ApiProperty({ type: [FilaDeBusDto] }) elementos!: FilaDeBusDto[];
  @ApiProperty({ type: [GrupoDeBusesDto] }) grupos!: GrupoDeBusesDto[];
}

export class ArchivoExportadoDto {
  @ApiProperty({ example: 'reporte-lineas-20261008-1530.csv' }) nombreDeArchivo!: string;
  @ApiProperty({ description: 'CSV con BOM UTF-8, coma como separador.' }) contenido!: string;
}

export class UsuarioDeConsultaDto {
  @ApiProperty() id!: number;
  @ApiProperty() nombre!: string;
  @ApiProperty() correo!: string;
}

export class ConsultaEnBitacoraDto {
  @ApiProperty() id!: number;
  @ApiProperty({ type: UsuarioDeConsultaDto }) usuario!: UsuarioDeConsultaDto;
  @ApiProperty({ enum: TIPOS }) tipo!: string;
  @ApiProperty({ type: FiltrosConNombresDto }) filtros!: FiltrosConNombresDto;
  @ApiProperty() fechaHora!: Date;
}

export class PaginaDeBitacoraDto {
  @ApiProperty({ type: [ConsultaEnBitacoraDto] }) elementos!: ConsultaEnBitacoraDto[];
  @ApiProperty() total!: number;
  @ApiProperty() pagina!: number;
  @ApiProperty() tamano!: number;
}

export class OpcionesDeReporteDto {
  @ApiProperty({ type: [LineaBasicaDto] }) lineas!: LineaBasicaDto[];
  @ApiProperty({ type: [LineaBasicaDto] }) estaciones!: LineaBasicaDto[];
  @ApiProperty({ type: [MunicipalidadBasicaDto] }) municipalidades!: MunicipalidadBasicaDto[];
  @ApiProperty({ type: [UsuarioDeConsultaDto] }) usuarios!: UsuarioDeConsultaDto[];
}
