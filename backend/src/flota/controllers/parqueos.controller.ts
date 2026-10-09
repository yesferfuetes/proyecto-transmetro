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
import { EditarParqueo } from '../commands/impl/editar-parqueo.command';
import { EliminarParqueo } from '../commands/impl/eliminar-parqueo.command';
import { RegistrarParqueo } from '../commands/impl/registrar-parqueo.command';
import { IdCreadoDto } from '../dtos/comunes.dto';
import { EditarParqueoDto, ParqueoDto, RegistrarParqueoDto } from '../dtos/parqueo.dto';
import { ParqueoNoExiste } from '../errors/errores-de-flota';
import { ListarParqueos } from '../queries/impl/listar-parqueos.query';
import { ObtenerParqueo } from '../queries/impl/obtener-parqueo.query';
import { idDelActor } from './actor';
import { ErroresDeEscritura, NoEncontrado } from './respuestas-de-error';

@ApiTags('flota')
@Controller('flota/parqueos')
export class ParqueosController {
  constructor(
    private readonly comandos: CommandBus,
    private readonly consultas: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Parqueos por estación y código, con su ocupación.' })
  @ApiOkResponse({ type: [ParqueoDto] })
  listar(): Promise<ParqueoDto[]> {
    return this.consultas.execute(new ListarParqueos());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Datos del parqueo y cuántos buses guarda.' })
  @ApiOkResponse({ type: ParqueoDto })
  @NoEncontrado('PARQUEO_NO_EXISTE')
  async obtener(@Param('id', ParseIntPipe) id: number): Promise<ParqueoDto> {
    const parqueo = await this.consultas.execute(new ObtenerParqueo(id));
    if (!parqueo) {
      throw new ParqueoNoExiste();
    }
    return parqueo;
  }

  @Post()
  @Roles('SUPERVISOR_MUNICIPAL')
  @ApiOperation({ summary: 'Registra un parqueo en una estación que tiene parqueo.' })
  @ApiCreatedResponse({ type: IdCreadoDto })
  @ErroresDeEscritura()
  async registrar(
    @Body() cuerpo: RegistrarParqueoDto,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<IdCreadoDto> {
    const id = await this.comandos.execute(new RegistrarParqueo(cuerpo, idDelActor(usuario)));
    return { id };
  }

  @Patch(':id')
  @Roles('SUPERVISOR_MUNICIPAL')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cambia la capacidad del parqueo.' })
  @ApiNoContentResponse()
  @ErroresDeEscritura()
  async editar(
    @Param('id', ParseIntPipe) id: number,
    @Body() cuerpo: EditarParqueoDto,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<void> {
    await this.comandos.execute(
      new EditarParqueo(id, cuerpo.capacidadVehiculos, idDelActor(usuario)),
    );
  }

  @Delete(':id')
  @Roles('SUPERVISOR_MUNICIPAL')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Elimina un parqueo que no guarda buses.' })
  @ApiNoContentResponse()
  @ErroresDeEscritura()
  async eliminar(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() usuario: UsuarioSesion | undefined,
  ): Promise<void> {
    await this.comandos.execute(new EliminarParqueo(id, idDelActor(usuario)));
  }
}
