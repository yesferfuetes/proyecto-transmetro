import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles, UsuarioActual } from '../../shared/auth/decoradores';
import type { UsuarioSesion } from '../../shared/auth/usuario-sesion';
import { AsignarLineaABus } from '../commands/impl/asignar-linea-a-bus.command';
import { CambiarEstadoDeBus } from '../commands/impl/cambiar-estado-de-bus.command';
import { CambiarParqueoDeBus } from '../commands/impl/cambiar-parqueo-de-bus.command';
import { EditarBus } from '../commands/impl/editar-bus.command';
import { RegistrarBus } from '../commands/impl/registrar-bus.command';
import {
  AsignarLineaDto,
  BusDto,
  CambiarEstadoDeBusDto,
  CambiarParqueoDto,
  EditarBusDto,
  FiltrosDeBusesDto,
  PaginaDeBusesDto,
  RegistrarBusDto,
} from '../dtos/bus.dto';
import { IdCreadoDto } from '../dtos/comunes.dto';
import { solicitudDePagina } from '../dtos/paginacion.dto';
import { BusNoExiste } from '../errors/errores-de-flota';
import { ListarBuses } from '../queries/impl/listar-buses.query';
import { ObtenerBus } from '../queries/impl/obtener-bus.query';
import { idDelActor } from './actor';
import { ErroresDeEscritura, NoEncontrado } from './respuestas-de-error';

@ApiTags('flota')
@Controller('flota/buses')
export class BusesController {
  constructor(
    private readonly comandos: CommandBus,
    private readonly consultas: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Buses por placa, con filtros.' })
  @ApiOkResponse({ type: PaginaDeBusesDto })
  listar(@Query() consulta: FiltrosDeBusesDto): Promise<PaginaDeBusesDto> {
    const { lineaId, sinLinea, estado, parqueoId, busqueda } = consulta;
    return this.consultas.execute(
      new ListarBuses(
        { lineaId, sinLinea, estado, parqueoId, busqueda },
        solicitudDePagina(consulta),
      ),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Datos del bus con su línea y su parqueo.' })
  @ApiOkResponse({ type: BusDto })
  @NoEncontrado('BUS_NO_EXISTE')
  async obtener(@Param('id', ParseIntPipe) id: number): Promise<BusDto> {
    const bus = await this.consultas.execute(new ObtenerBus(id));
    if (!bus) {
      throw new BusNoExiste();
    }
    return bus;
  }

  @Post()
  @Roles('SUPERVISOR_MUNICIPAL')
  @ApiOperation({ summary: 'Registra un bus activo en un parqueo, con línea opcional.' })
  @ApiCreatedResponse({ type: IdCreadoDto })
  @ErroresDeEscritura()
  async registrar(
    @Body() cuerpo: RegistrarBusDto,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<IdCreadoDto> {
    const id = await this.comandos.execute(new RegistrarBus(cuerpo, idDelActor(usuario)));
    return { id };
  }

  @Patch(':id')
  @Roles('SUPERVISOR_MUNICIPAL')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cambia la capacidad máxima del bus.' })
  @ApiNoContentResponse()
  @ErroresDeEscritura()
  async editar(
    @Param('id', ParseIntPipe) id: number,
    @Body() cuerpo: EditarBusDto,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<void> {
    await this.comandos.execute(new EditarBus(id, cuerpo.capacidadMax, idDelActor(usuario)));
  }

  @Put(':id/linea')
  @Roles('SUPERVISOR_MUNICIPAL')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Asigna el bus a una línea o, con null, lo deja sin línea.' })
  @ApiNoContentResponse()
  @ErroresDeEscritura()
  async asignarLinea(
    @Param('id', ParseIntPipe) id: number,
    @Body() cuerpo: AsignarLineaDto,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<void> {
    await this.comandos.execute(new AsignarLineaABus(id, cuerpo.lineaId, idDelActor(usuario)));
  }

  @Put(':id/parqueo')
  @Roles('SUPERVISOR_MUNICIPAL')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cambia el parqueo del bus.' })
  @ApiNoContentResponse()
  @ErroresDeEscritura()
  async cambiarParqueo(
    @Param('id', ParseIntPipe) id: number,
    @Body() cuerpo: CambiarParqueoDto,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<void> {
    await this.comandos.execute(new CambiarParqueoDeBus(id, cuerpo.parqueoId, idDelActor(usuario)));
  }

  @Put(':id/estado')
  @Roles('SUPERVISOR_MUNICIPAL')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cambia el estado del bus; la baja le quita la línea.' })
  @ApiNoContentResponse()
  @ErroresDeEscritura()
  async cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() cuerpo: CambiarEstadoDeBusDto,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<void> {
    await this.comandos.execute(new CambiarEstadoDeBus(id, cuerpo.estado, idDelActor(usuario)));
  }
}
