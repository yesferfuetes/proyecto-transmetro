import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Put,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles, UsuarioActual } from '../../shared/auth/decoradores';
import type { UsuarioSesion } from '../../shared/auth/usuario-sesion';
import { AtenderAlerta } from '../commands/impl/atender-alerta.command';
import {
  FiltroDeEstacionDto,
  FiltrosDeAlertasDto,
  HuellaDeAlertasDto,
  OpcionesDeAlertasDto,
  PaginaDeAlertasDto,
} from '../dtos/alerta.dto';
import { solicitudDePagina } from '../dtos/paginacion.dto';
import { ListarAlertas } from '../queries/impl/listar-alertas.query';
import { ListarOpcionesDeAlertas } from '../queries/impl/listar-opciones-de-alertas.query';
import { ObtenerHuellaDeAlertas } from '../queries/impl/obtener-huella-de-alertas.query';
import { alcanceDeEstacion, exigirSesion } from './actor';
import { ErroresDeEscritura } from './respuestas-de-error';

@ApiTags('alertas')
@Controller('alertas')
export class AlertasController {
  constructor(
    private readonly comandos: CommandBus,
    private readonly consultas: QueryBus,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Alertas, pendientes primero. El operador solo ve las de su estación.',
  })
  @ApiOkResponse({ type: PaginaDeAlertasDto })
  listar(
    @Query() consulta: FiltrosDeAlertasDto,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<PaginaDeAlertasDto> {
    const { estado, tipo, lineaId } = consulta;
    const estacionId = alcanceDeEstacion(usuario, consulta.estacionId);
    return this.consultas.execute(
      new ListarAlertas({ estacionId, lineaId, estado, tipo }, solicitudDePagina(consulta)),
    );
  }

  @Get('huella')
  @ApiOperation({
    summary: 'Pendientes, atendidas y última alerta, para saber si la lista cambió.',
  })
  @ApiOkResponse({ type: HuellaDeAlertasDto })
  huella(
    @Query() consulta: FiltroDeEstacionDto,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<HuellaDeAlertasDto> {
    return this.consultas.execute(
      new ObtenerHuellaDeAlertas(alcanceDeEstacion(usuario, consulta.estacionId)),
    );
  }

  @Get('opciones')
  @Roles('SUPERVISOR_MUNICIPAL', 'ADMINISTRADOR')
  @ApiOperation({ summary: 'Estaciones y líneas para los filtros.' })
  @ApiOkResponse({ type: OpcionesDeAlertasDto })
  opciones(): Promise<OpcionesDeAlertasDto> {
    return this.consultas.execute(new ListarOpcionesDeAlertas());
  }

  @Put(':id/atencion')
  @Roles('OPERADOR_ESTACION')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Marca la alerta como atendida por el operador de su estación.' })
  @ApiNoContentResponse()
  @ErroresDeEscritura()
  async atender(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<void> {
    const sesion = exigirSesion(usuario);
    await this.comandos.execute(new AtenderAlerta(id, sesion.estacionId, sesion.id));
  }
}
