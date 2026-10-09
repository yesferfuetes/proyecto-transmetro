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
import { EditarGuardia } from '../commands/impl/editar-guardia.command';
import { RegistrarGuardia } from '../commands/impl/registrar-guardia.command';
import { IdCreadoDto } from '../dtos/comunes.dto';
import {
  DetalleDeGuardiaDto,
  FiltrosDeGuardiasDto,
  GuardiaDto,
  OpcionDeGuardiaDto,
  PaginaDeGuardiasDto,
} from '../dtos/guardia.dto';
import { solicitudDePagina } from '../dtos/paginacion.dto';
import { GuardiaNoExiste } from '../errors/errores-de-accesos';
import { ListarGuardias } from '../queries/impl/listar-guardias.query';
import { ListarOpcionesDeGuardia } from '../queries/impl/listar-opciones-de-guardia.query';
import { ObtenerGuardia } from '../queries/impl/obtener-guardia.query';
import { idDelActor } from './actor';
import { ErroresDeEscritura, NoEncontrado } from './respuestas-de-error';

@ApiTags('guardias')
@Controller('guardias')
export class GuardiasController {
  constructor(
    private readonly comandos: CommandBus,
    private readonly consultas: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Guardias por nombre, con búsqueda por nombre o DPI.' })
  @ApiOkResponse({ type: PaginaDeGuardiasDto })
  listar(@Query() consulta: FiltrosDeGuardiasDto): Promise<PaginaDeGuardiasDto> {
    return this.consultas.execute(
      new ListarGuardias(consulta.busqueda, solicitudDePagina(consulta)),
    );
  }

  // Se declara antes de ':id' para que "opciones" no se lea como un id.
  @Get('opciones')
  @ApiOperation({ summary: 'Todos los guardias con id, nombre y DPI, para elegir uno.' })
  @ApiOkResponse({ type: [OpcionDeGuardiaDto] })
  listarOpciones(): Promise<OpcionDeGuardiaDto[]> {
    return this.consultas.execute(new ListarOpcionesDeGuardia());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Guardia con los accesos que cubre y sus turnos.' })
  @ApiOkResponse({ type: DetalleDeGuardiaDto })
  @NoEncontrado('GUARDIA_NO_EXISTE')
  async obtener(@Param('id', ParseIntPipe) id: number): Promise<DetalleDeGuardiaDto> {
    const guardia = await this.consultas.execute(new ObtenerGuardia(id));
    if (!guardia) {
      throw new GuardiaNoExiste();
    }
    return guardia;
  }

  @Post()
  @Roles('SUPERVISOR_MUNICIPAL')
  @ApiOperation({ summary: 'Registra un guardia.' })
  @ApiCreatedResponse({ type: IdCreadoDto })
  @ErroresDeEscritura()
  async registrar(
    @Body() cuerpo: GuardiaDto,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<IdCreadoDto> {
    const datos = { ...cuerpo, telefono: cuerpo.telefono ?? null };
    const id = await this.comandos.execute(new RegistrarGuardia(datos, idDelActor(usuario)));
    return { id };
  }

  @Patch(':id')
  @Roles('SUPERVISOR_MUNICIPAL')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Edita un guardia. Sin teléfono, se quita el que tenía.' })
  @ApiNoContentResponse()
  @ErroresDeEscritura()
  async editar(
    @Param('id', ParseIntPipe) id: number,
    @Body() cuerpo: GuardiaDto,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<void> {
    const datos = { ...cuerpo, telefono: cuerpo.telefono ?? null };
    await this.comandos.execute(new EditarGuardia(id, datos, idDelActor(usuario)));
  }
}
