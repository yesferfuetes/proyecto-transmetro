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
import { EditarEstacion } from '../commands/impl/editar-estacion.command';
import { RegistrarEstacion } from '../commands/impl/registrar-estacion.command';
import { IdCreadoDto } from '../dtos/comunes.dto';
import {
  DetalleDeEstacionDto,
  EditarEstacionDto,
  FiltrosDeEstacionesDto,
  OpcionDeEstacionDto,
  PaginaDeEstacionesDto,
  RegistrarEstacionDto,
} from '../dtos/estacion.dto';
import { solicitudDePagina } from '../dtos/paginacion.dto';
import { EstacionNoExiste } from '../errors/errores-de-red';
import { ListarEstaciones } from '../queries/impl/listar-estaciones.query';
import { ListarOpcionesDeEstacion } from '../queries/impl/listar-opciones-de-estacion.query';
import { ObtenerEstacion } from '../queries/impl/obtener-estacion.query';
import { idDelActor } from './actor';
import { ErroresDeEscritura, NoEncontrado } from './respuestas-de-error';

@ApiTags('estaciones')
@Controller('estaciones')
export class EstacionesController {
  constructor(
    private readonly comandos: CommandBus,
    private readonly consultas: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Estaciones por código, con filtros y búsqueda.' })
  @ApiOkResponse({ type: PaginaDeEstacionesDto })
  listar(@Query() consulta: FiltrosDeEstacionesDto): Promise<PaginaDeEstacionesDto> {
    const { municipalidadId, lineaId, tieneParqueo, busqueda } = consulta;
    return this.consultas.execute(
      new ListarEstaciones(
        { municipalidadId, lineaId, tieneParqueo, busqueda },
        solicitudDePagina(consulta),
      ),
    );
  }

  // Se declara antes de ':id' para que "opciones" no se lea como un id.
  @Get('opciones')
  @ApiOperation({ summary: 'Todas las estaciones con id, código y nombre, para elegir una.' })
  @ApiOkResponse({ type: [OpcionDeEstacionDto] })
  listarOpciones(): Promise<OpcionDeEstacionDto[]> {
    return this.consultas.execute(new ListarOpcionesDeEstacion());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Datos de la estación y las líneas que pasan por ella.' })
  @ApiOkResponse({ type: DetalleDeEstacionDto })
  @NoEncontrado('ESTACION_NO_EXISTE')
  async obtener(@Param('id', ParseIntPipe) id: number): Promise<DetalleDeEstacionDto> {
    const estacion = await this.consultas.execute(new ObtenerEstacion(id));
    if (!estacion) {
      throw new EstacionNoExiste();
    }
    return estacion;
  }

  @Post()
  @Roles('SUPERVISOR_MUNICIPAL')
  @ApiOperation({ summary: 'Registra una estación.' })
  @ApiCreatedResponse({ type: IdCreadoDto })
  @ErroresDeEscritura()
  async registrar(
    @Body() cuerpo: RegistrarEstacionDto,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<IdCreadoDto> {
    const datos = { ...cuerpo, latitud: cuerpo.latitud ?? null, longitud: cuerpo.longitud ?? null };
    const id = await this.comandos.execute(new RegistrarEstacion(datos, idDelActor(usuario)));
    return { id };
  }

  @Patch(':id')
  @Roles('SUPERVISOR_MUNICIPAL')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Edita una estación. El código no se cambia.' })
  @ApiNoContentResponse()
  @ErroresDeEscritura()
  async editar(
    @Param('id', ParseIntPipe) id: number,
    @Body() cuerpo: EditarEstacionDto,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<void> {
    await this.comandos.execute(new EditarEstacion(id, cuerpo, idDelActor(usuario)));
  }
}
