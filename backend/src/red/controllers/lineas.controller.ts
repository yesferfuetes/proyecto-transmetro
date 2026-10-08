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
import { CambiarEstadoDeLinea } from '../commands/impl/cambiar-estado-de-linea.command';
import { DefinirRecorridoDeLinea } from '../commands/impl/definir-recorrido-de-linea.command';
import { EditarLinea } from '../commands/impl/editar-linea.command';
import { RegistrarLinea } from '../commands/impl/registrar-linea.command';
import { IdCreadoDto } from '../dtos/comunes.dto';
import {
  CambiarEstadoDeLineaDto,
  DefinirRecorridoDto,
  DetalleDeLineaDto,
  EditarLineaDto,
  FiltrosDeLineasDto,
  PaginaDeLineasDto,
  RegistrarLineaDto,
} from '../dtos/linea.dto';
import { solicitudDePagina } from '../dtos/paginacion.dto';
import { LineaNoExiste } from '../errors/errores-de-red';
import { ListarLineas } from '../queries/impl/listar-lineas.query';
import { ObtenerLinea } from '../queries/impl/obtener-linea.query';
import { idDelActor } from './actor';
import { ErroresDeEscritura, NoEncontrado } from './respuestas-de-error';

@ApiTags('lineas')
@Controller('lineas')
export class LineasController {
  constructor(
    private readonly comandos: CommandBus,
    private readonly consultas: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Líneas por código, con filtros.' })
  @ApiOkResponse({ type: PaginaDeLineasDto })
  listar(@Query() consulta: FiltrosDeLineasDto): Promise<PaginaDeLineasDto> {
    const { municipalidadId, estado, estacionId } = consulta;
    return this.consultas.execute(
      new ListarLineas({ municipalidadId, estado, estacionId }, solicitudDePagina(consulta)),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Datos de la línea y su recorrido en orden.' })
  @ApiOkResponse({ type: DetalleDeLineaDto })
  @NoEncontrado('LINEA_NO_EXISTE')
  async obtener(@Param('id', ParseIntPipe) id: number): Promise<DetalleDeLineaDto> {
    const linea = await this.consultas.execute(new ObtenerLinea(id));
    if (!linea) {
      throw new LineaNoExiste();
    }
    return linea;
  }

  @Post()
  @Roles('SUPERVISOR_MUNICIPAL')
  @ApiOperation({ summary: 'Registra una línea sin recorrido.' })
  @ApiCreatedResponse({ type: IdCreadoDto })
  @ErroresDeEscritura()
  async registrar(
    @Body() cuerpo: RegistrarLineaDto,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<IdCreadoDto> {
    const id = await this.comandos.execute(new RegistrarLinea(cuerpo, idDelActor(usuario)));
    return { id };
  }

  @Patch(':id')
  @Roles('SUPERVISOR_MUNICIPAL')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Edita nombre o municipalidad de la línea.' })
  @ApiNoContentResponse()
  @ErroresDeEscritura()
  async editar(
    @Param('id', ParseIntPipe) id: number,
    @Body() cuerpo: EditarLineaDto,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<void> {
    await this.comandos.execute(new EditarLinea(id, cuerpo, idDelActor(usuario)));
  }

  @Put(':id/estado')
  @Roles('SUPERVISOR_MUNICIPAL')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cambia el estado de la línea.' })
  @ApiNoContentResponse()
  @ErroresDeEscritura()
  async cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() cuerpo: CambiarEstadoDeLineaDto,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<void> {
    await this.comandos.execute(new CambiarEstadoDeLinea(id, cuerpo.estado, idDelActor(usuario)));
  }

  @Put(':id/recorrido')
  @Roles('SUPERVISOR_MUNICIPAL')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Reemplaza el recorrido completo de la línea y recalcula su longitud.' })
  @ApiNoContentResponse()
  @ErroresDeEscritura()
  async definirRecorrido(
    @Param('id', ParseIntPipe) id: number,
    @Body() cuerpo: DefinirRecorridoDto,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<void> {
    const paradas = cuerpo.paradas.map((parada) => ({
      estacionId: parada.estacionId,
      distanciaSiguienteKm: parada.distanciaSiguienteKm ?? null,
    }));
    await this.comandos.execute(new DefinirRecorridoDeLinea(id, paradas, idDelActor(usuario)));
  }
}
