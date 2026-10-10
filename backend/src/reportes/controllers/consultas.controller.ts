import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles, UsuarioActual } from '../../shared/auth/decoradores';
import type { UsuarioSesion } from '../../shared/auth/usuario-sesion';
import { RegistrarConsultaDeReporte } from '../commands/impl/registrar-consulta-de-reporte.command';
import { IdDeConsultaDto, PaginaDeReporteDto, RegistrarConsultaDto } from '../dtos/consulta.dto';
import { solicitudDePagina } from '../dtos/paginacion.dto';
import {
  ArchivoExportadoDto,
  ReporteDeBusesDto,
  ReporteDeEstacionesDto,
  ReporteDeLineasDto,
} from '../dtos/respuestas.dto';
import { ExportarReporte } from '../queries/impl/exportar-reporte.query';
import { ObtenerReporteDeBuses } from '../queries/impl/obtener-reporte-de-buses.query';
import { ObtenerReporteDeEstaciones } from '../queries/impl/obtener-reporte-de-estaciones.query';
import { ObtenerReporteDeLineas } from '../queries/impl/obtener-reporte-de-lineas.query';
import { idDelActor } from './actor';
import { ConsultaAjena, ErroresDeReportes } from './respuestas-de-error';

@ApiTags('reportes')
@Controller('reportes/consultas')
export class ConsultasController {
  constructor(
    private readonly comandos: CommandBus,
    private readonly consultas: QueryBus,
  ) {}

  @Post()
  @Roles('SUPERVISOR_MUNICIPAL', 'ADMINISTRADOR')
  @ApiOperation({
    summary: 'Valida el tipo y los filtros y deja la constancia de la consulta; devuelve su id.',
  })
  @ApiCreatedResponse({ type: IdDeConsultaDto })
  @ErroresDeReportes()
  async registrar(
    @Body() cuerpo: RegistrarConsultaDto,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<IdDeConsultaDto> {
    const { tipo, lineaId, estacionId, municipalidadId } = cuerpo;
    const id = await this.comandos.execute(
      new RegistrarConsultaDeReporte(
        tipo,
        { lineaId, estacionId, municipalidadId },
        idDelActor(usuario),
      ),
    );
    return { id };
  }

  @Get(':id/estaciones')
  @Roles('SUPERVISOR_MUNICIPAL', 'ADMINISTRADOR')
  @ApiOperation({ summary: 'Reporte de estaciones de una constancia propia, paginado.' })
  @ApiOkResponse({ type: ReporteDeEstacionesDto })
  @ErroresDeReportes()
  @ConsultaAjena()
  estaciones(
    @Param('id', ParseIntPipe) id: number,
    @Query() paginacion: PaginaDeReporteDto,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<ReporteDeEstacionesDto> {
    return this.consultas.execute(
      new ObtenerReporteDeEstaciones(id, idDelActor(usuario), solicitudDePagina(paginacion)),
    );
  }

  @Get(':id/lineas')
  @Roles('SUPERVISOR_MUNICIPAL', 'ADMINISTRADOR')
  @ApiOperation({ summary: 'Reporte de líneas de una constancia propia, paginado.' })
  @ApiOkResponse({ type: ReporteDeLineasDto })
  @ErroresDeReportes()
  @ConsultaAjena()
  lineas(
    @Param('id', ParseIntPipe) id: number,
    @Query() paginacion: PaginaDeReporteDto,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<ReporteDeLineasDto> {
    return this.consultas.execute(
      new ObtenerReporteDeLineas(id, idDelActor(usuario), solicitudDePagina(paginacion)),
    );
  }

  @Get(':id/buses')
  @Roles('SUPERVISOR_MUNICIPAL', 'ADMINISTRADOR')
  @ApiOperation({ summary: 'Reporte de buses por línea de una constancia propia, paginado.' })
  @ApiOkResponse({ type: ReporteDeBusesDto })
  @ErroresDeReportes()
  @ConsultaAjena()
  buses(
    @Param('id', ParseIntPipe) id: number,
    @Query() paginacion: PaginaDeReporteDto,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<ReporteDeBusesDto> {
    return this.consultas.execute(
      new ObtenerReporteDeBuses(id, idDelActor(usuario), solicitudDePagina(paginacion)),
    );
  }

  @Get(':id/exportacion')
  @Roles('SUPERVISOR_MUNICIPAL', 'ADMINISTRADOR')
  @ApiOperation({ summary: 'CSV con todas las filas del reporte de una constancia propia.' })
  @ApiOkResponse({ type: ArchivoExportadoDto })
  @ErroresDeReportes()
  @ConsultaAjena()
  exportacion(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<ArchivoExportadoDto> {
    return this.consultas.execute(new ExportarReporte(id, idDelActor(usuario)));
  }
}
