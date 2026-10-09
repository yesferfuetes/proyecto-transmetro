import {
  Body,
  Controller,
  Delete,
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
import { AsignarGuardia } from '../commands/impl/asignar-guardia.command';
import { EditarAcceso } from '../commands/impl/editar-acceso.command';
import { QuitarAsignacion } from '../commands/impl/quitar-asignacion.command';
import { RegistrarAcceso } from '../commands/impl/registrar-acceso.command';
import {
  AccesosDeLineaDto,
  AsignarGuardiaDto,
  DetalleDeAccesoDto,
  EditarAccesoDto,
  FiltrosDeAccesosDto,
  PaginaDeAccesosDto,
  QuitarAsignacionDto,
  RegistrarAccesoDto,
} from '../dtos/acceso.dto';
import { IdCreadoDto, ReferenciaDeEstacionDto } from '../dtos/comunes.dto';
import { solicitudDePagina } from '../dtos/paginacion.dto';
import { AccesoNoExiste } from '../errors/errores-de-accesos';
import { ListarAccesosDeLinea } from '../queries/impl/listar-accesos-de-linea.query';
import { ListarAccesos } from '../queries/impl/listar-accesos.query';
import { ListarOpcionesDeEstacion } from '../queries/impl/listar-opciones-de-estacion.query';
import { ObtenerAcceso } from '../queries/impl/obtener-acceso.query';
import { idDelActor } from './actor';
import { ErroresDeEscritura, NoEncontrado } from './respuestas-de-error';

@ApiTags('accesos')
@Controller('accesos')
export class AccesosController {
  constructor(
    private readonly comandos: CommandBus,
    private readonly consultas: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Accesos agrupados por estación, con filtros, búsqueda y paginación.' })
  @ApiOkResponse({ type: PaginaDeAccesosDto })
  listar(@Query() consulta: FiltrosDeAccesosDto): Promise<PaginaDeAccesosDto> {
    const { lineaId, estacionId, busqueda } = consulta;
    return this.consultas.execute(
      new ListarAccesos({ lineaId, estacionId, busqueda }, solicitudDePagina(consulta)),
    );
  }

  // Las rutas fijas se declaran antes de ':id' para que no se lean como un id.
  @Get('opciones/estaciones')
  @ApiOperation({ summary: 'Todas las estaciones con id, código y nombre, para elegir una.' })
  @ApiOkResponse({ type: [ReferenciaDeEstacionDto] })
  listarOpcionesDeEstacion(): Promise<ReferenciaDeEstacionDto[]> {
    return this.consultas.execute(new ListarOpcionesDeEstacion());
  }

  @Get('lineas/:lineaId')
  @ApiOperation({ summary: 'Estaciones de una línea en orden de recorrido, con sus accesos.' })
  @ApiOkResponse({ type: AccesosDeLineaDto })
  @NoEncontrado('LINEA_NO_EXISTE')
  listarDeLinea(@Param('lineaId', ParseIntPipe) lineaId: number): Promise<AccesosDeLineaDto> {
    return this.consultas.execute(new ListarAccesosDeLinea(lineaId));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Acceso con su estación y los guardias asignados por turno.' })
  @ApiOkResponse({ type: DetalleDeAccesoDto })
  @NoEncontrado('ACCESO_NO_EXISTE')
  async obtener(@Param('id', ParseIntPipe) id: number): Promise<DetalleDeAccesoDto> {
    const acceso = await this.consultas.execute(new ObtenerAcceso(id));
    if (!acceso) {
      throw new AccesoNoExiste();
    }
    return acceso;
  }

  @Post()
  @Roles('SUPERVISOR_MUNICIPAL')
  @ApiOperation({ summary: 'Registra un acceso junto con su primera asignación.' })
  @ApiCreatedResponse({ type: IdCreadoDto })
  @ErroresDeEscritura()
  async registrar(
    @Body() cuerpo: RegistrarAccesoDto,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<IdCreadoDto> {
    const datos = {
      estacionId: cuerpo.estacionId,
      codigo: cuerpo.codigo,
      nombre: cuerpo.nombre ?? null,
      guardiaId: cuerpo.guardiaId ?? null,
      turno: cuerpo.turno ?? '',
    };
    const id = await this.comandos.execute(new RegistrarAcceso(datos, idDelActor(usuario)));
    return { id };
  }

  @Patch(':id')
  @Roles('SUPERVISOR_MUNICIPAL')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cambia el nombre de un acceso. El código y la estación no cambian.' })
  @ApiNoContentResponse()
  @ErroresDeEscritura()
  async editar(
    @Param('id', ParseIntPipe) id: number,
    @Body() cuerpo: EditarAccesoDto,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<void> {
    await this.comandos.execute(new EditarAcceso(id, cuerpo.nombre, idDelActor(usuario)));
  }

  @Post(':id/asignaciones')
  @Roles('SUPERVISOR_MUNICIPAL')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Asigna un guardia al acceso en un turno.' })
  @ApiNoContentResponse()
  @ErroresDeEscritura()
  async asignar(
    @Param('id', ParseIntPipe) id: number,
    @Body() cuerpo: AsignarGuardiaDto,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<void> {
    await this.comandos.execute(
      new AsignarGuardia(id, cuerpo.guardiaId, cuerpo.turno, idDelActor(usuario)),
    );
  }

  @Delete(':id/asignaciones')
  @Roles('SUPERVISOR_MUNICIPAL')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Quita una asignación. No se puede quitar la última del acceso.' })
  @ApiNoContentResponse()
  @ErroresDeEscritura()
  async quitar(
    @Param('id', ParseIntPipe) id: number,
    @Query() consulta: QuitarAsignacionDto,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<void> {
    await this.comandos.execute(
      new QuitarAsignacion(id, consulta.guardiaId, consulta.turno, idDelActor(usuario)),
    );
  }
}
