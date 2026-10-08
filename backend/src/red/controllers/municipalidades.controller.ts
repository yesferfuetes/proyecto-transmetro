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
import { EditarMunicipalidad } from '../commands/impl/editar-municipalidad.command';
import { RegistrarMunicipalidad } from '../commands/impl/registrar-municipalidad.command';
import { IdCreadoDto } from '../dtos/comunes.dto';
import {
  EditarMunicipalidadDto,
  MunicipalidadDto,
  PaginaDeMunicipalidadesDto,
  RegistrarMunicipalidadDto,
} from '../dtos/municipalidad.dto';
import { PaginacionDto, solicitudDePagina } from '../dtos/paginacion.dto';
import { MunicipalidadNoExiste } from '../errors/errores-de-red';
import { ListarMunicipalidades } from '../queries/impl/listar-municipalidades.query';
import { ObtenerMunicipalidad } from '../queries/impl/obtener-municipalidad.query';
import { idDelActor } from './actor';
import { ErroresDeEscritura, NoEncontrado } from './respuestas-de-error';

@ApiTags('municipalidades')
@Controller('municipalidades')
export class MunicipalidadesController {
  constructor(
    private readonly comandos: CommandBus,
    private readonly consultas: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Municipalidades por nombre, con su número de líneas y estaciones.' })
  @ApiOkResponse({ type: PaginaDeMunicipalidadesDto })
  listar(@Query() consulta: PaginacionDto): Promise<PaginaDeMunicipalidadesDto> {
    return this.consultas.execute(new ListarMunicipalidades(solicitudDePagina(consulta)));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Datos de una municipalidad.' })
  @ApiOkResponse({ type: MunicipalidadDto })
  @NoEncontrado('MUNICIPALIDAD_NO_EXISTE')
  async obtener(@Param('id', ParseIntPipe) id: number): Promise<MunicipalidadDto> {
    const municipalidad = await this.consultas.execute(new ObtenerMunicipalidad(id));
    if (!municipalidad) {
      throw new MunicipalidadNoExiste();
    }
    return municipalidad;
  }

  @Post()
  @Roles('ADMINISTRADOR')
  @ApiOperation({ summary: 'Registra una municipalidad.' })
  @ApiCreatedResponse({ type: IdCreadoDto })
  @ErroresDeEscritura()
  async registrar(
    @Body() cuerpo: RegistrarMunicipalidadDto,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<IdCreadoDto> {
    const id = await this.comandos.execute(
      new RegistrarMunicipalidad(
        cuerpo.nombre,
        cuerpo.departamento ?? null,
        cuerpo.fechaIncorporacion ?? null,
        idDelActor(usuario),
      ),
    );
    return { id };
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Edita nombre, departamento o fecha de incorporación.' })
  @ApiNoContentResponse()
  @ErroresDeEscritura()
  async editar(
    @Param('id', ParseIntPipe) id: number,
    @Body() cuerpo: EditarMunicipalidadDto,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<void> {
    await this.comandos.execute(new EditarMunicipalidad(id, cuerpo, idDelActor(usuario)));
  }
}
