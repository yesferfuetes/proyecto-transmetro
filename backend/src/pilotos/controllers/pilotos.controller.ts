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
  ApiExtraModels,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { Roles, UsuarioActual } from '../../shared/auth/decoradores';
import type { UsuarioSesion } from '../../shared/auth/usuario-sesion';
import { AsignarBusAPiloto } from '../commands/impl/asignar-bus-a-piloto.command';
import { EditarPiloto } from '../commands/impl/editar-piloto.command';
import { RegistrarPiloto } from '../commands/impl/registrar-piloto.command';
import {
  AsignarBusDto,
  DatosDePilotoDto,
  FiltrosDePilotosDto,
  IdCreadoDto,
  OpcionesDePilotosDto,
  PaginaDePilotosDto,
  PilotoCompletoDto,
  PilotoEnListadoCompletoDto,
  PilotoReducidoDto,
  RegistrarPilotoDto,
} from '../dtos/piloto.dto';
import { solicitudDePagina } from '../dtos/paginacion.dto';
import { PilotoNoExiste } from '../errors/errores-de-pilotos';
import { ListarOpcionesDePilotos } from '../queries/impl/listar-opciones-de-pilotos.query';
import { ListarPilotos } from '../queries/impl/listar-pilotos.query';
import { ObtenerPiloto } from '../queries/impl/obtener-piloto.query';
import type { DatosDePiloto } from '../services/validaciones';
import { idDelActor, veVistaCompleta } from './actor';
import { ErroresDeEscritura, NoEncontrado } from './respuestas-de-error';

function aDatos(cuerpo: DatosDePilotoDto): DatosDePiloto {
  return {
    nombre: cuerpo.nombre ?? '',
    dpi: cuerpo.dpi ?? '',
    direccionResidencia: cuerpo.direccionResidencia ?? '',
    telefono: cuerpo.telefono ?? '',
    correo: cuerpo.correo ?? null,
    historialEducativo: cuerpo.historialEducativo ?? '',
  };
}

@ApiTags('pilotos')
@ApiExtraModels(PilotoReducidoDto, PilotoEnListadoCompletoDto, PilotoCompletoDto)
@Controller('pilotos')
export class PilotosController {
  constructor(
    private readonly comandos: CommandBus,
    private readonly consultas: QueryBus,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Pilotos por nombre. El operador recibe la ficha reducida; supervisor y administrador, con DPI.',
  })
  @ApiOkResponse({ type: PaginaDePilotosDto })
  listar(
    @Query() consulta: FiltrosDePilotosDto,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<PaginaDePilotosDto> {
    const { lineaId, busId, sinBus, busqueda } = consulta;
    return this.consultas.execute(
      new ListarPilotos(
        { lineaId, busId, sinBus, busqueda },
        veVistaCompleta(usuario),
        solicitudDePagina(consulta),
      ),
    );
  }

  // Se declara antes de ':id' para que "opciones" no se lea como un id.
  @Get('opciones')
  @ApiOperation({ summary: 'Buses asignables (no de baja) y líneas con buses, para elegir.' })
  @ApiOkResponse({ type: OpcionesDePilotosDto })
  listarOpciones(): Promise<OpcionesDePilotosDto> {
    return this.consultas.execute(new ListarOpcionesDePilotos());
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Ficha del piloto: reducida para el operador, completa para los demás.',
  })
  @ApiOkResponse({
    schema: {
      oneOf: [
        { $ref: getSchemaPath(PilotoReducidoDto) },
        { $ref: getSchemaPath(PilotoCompletoDto) },
      ],
    },
  })
  @NoEncontrado('PILOTO_NO_EXISTE')
  async obtener(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<PilotoReducidoDto | PilotoCompletoDto> {
    const piloto = await this.consultas.execute(new ObtenerPiloto(id, veVistaCompleta(usuario)));
    if (!piloto) {
      throw new PilotoNoExiste();
    }
    return piloto;
  }

  @Post()
  @Roles('SUPERVISOR_MUNICIPAL')
  @ApiOperation({ summary: 'Registra un piloto, con bus opcional.' })
  @ApiCreatedResponse({ type: IdCreadoDto })
  @ErroresDeEscritura()
  async registrar(
    @Body() cuerpo: RegistrarPilotoDto,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<IdCreadoDto> {
    const id = await this.comandos.execute(
      new RegistrarPiloto(aDatos(cuerpo), cuerpo.busId ?? null, idDelActor(usuario)),
    );
    return { id };
  }

  @Patch(':id')
  @Roles('SUPERVISOR_MUNICIPAL')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Edita el expediente del piloto (el bus se cambia en PUT :id/bus).' })
  @ApiNoContentResponse()
  @ErroresDeEscritura()
  async editar(
    @Param('id', ParseIntPipe) id: number,
    @Body() cuerpo: DatosDePilotoDto,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<void> {
    await this.comandos.execute(new EditarPiloto(id, aDatos(cuerpo), idDelActor(usuario)));
  }

  @Put(':id/bus')
  @Roles('SUPERVISOR_MUNICIPAL')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Asigna el piloto a un bus o, con null, lo deja sin bus.' })
  @ApiNoContentResponse()
  @ErroresDeEscritura()
  async asignarBus(
    @Param('id', ParseIntPipe) id: number,
    @Body() cuerpo: AsignarBusDto,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<void> {
    await this.comandos.execute(new AsignarBusAPiloto(id, cuerpo.busId, idDelActor(usuario)));
  }
}
