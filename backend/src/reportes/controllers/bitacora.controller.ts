import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../shared/auth/decoradores';
import { FiltrosDeBitacoraDto } from '../dtos/bitacora.dto';
import { solicitudDePagina } from '../dtos/paginacion.dto';
import { OpcionesDeReporteDto, PaginaDeBitacoraDto } from '../dtos/respuestas.dto';
import { ListarConsultasDeReporte } from '../queries/impl/listar-consultas-de-reporte.query';
import { ListarOpcionesDeReporte } from '../queries/impl/listar-opciones-de-reporte.query';
import { ErroresDeReportes } from './respuestas-de-error';

@ApiTags('reportes')
@Controller('reportes')
export class BitacoraController {
  constructor(private readonly consultas: QueryBus) {}

  @Get('bitacora')
  @Roles('SUPERVISOR_MUNICIPAL', 'ADMINISTRADOR')
  @ApiOperation({
    summary: 'Constancias de todos los usuarios, de la más reciente a la más antigua.',
  })
  @ApiOkResponse({ type: PaginaDeBitacoraDto })
  @ErroresDeReportes()
  listar(@Query() consulta: FiltrosDeBitacoraDto): Promise<PaginaDeBitacoraDto> {
    const { usuarioId, tipo, desde, hasta } = consulta;
    return this.consultas.execute(
      new ListarConsultasDeReporte({ usuarioId, tipo, desde, hasta }, solicitudDePagina(consulta)),
    );
  }

  @Get('opciones')
  @Roles('SUPERVISOR_MUNICIPAL', 'ADMINISTRADOR')
  @ApiOperation({
    summary: 'Líneas, estaciones, municipalidades y usuarios con constancias, para los filtros.',
  })
  @ApiOkResponse({ type: OpcionesDeReporteDto })
  @ErroresDeReportes()
  opciones(): Promise<OpcionesDeReporteDto> {
    return this.consultas.execute(new ListarOpcionesDeReporte());
  }
}
