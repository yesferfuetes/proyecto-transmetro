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
import { ApiCreatedResponse, ApiNoContentResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Roles, UsuarioActual } from '../../shared/auth/decoradores';
import type { UsuarioSesion } from '../../shared/auth/usuario-sesion';
import { AsignarContrasena } from '../commands/impl/asignar-contrasena.command';
import { DesactivarUsuario } from '../commands/impl/desactivar-usuario.command';
import { EditarUsuario } from '../commands/impl/editar-usuario.command';
import { ReactivarUsuario } from '../commands/impl/reactivar-usuario.command';
import { RegistrarUsuario } from '../commands/impl/registrar-usuario.command';
import {
  EstacionAsignableDto,
  FiltrosDeUsuariosDto,
  PaginaDeUsuariosDto,
  UsuarioDetalleDto,
} from '../dtos/consultas.dto';
import { AsignarContrasenaDto } from '../dtos/contrasenas.dto';
import { EditarUsuarioDto, IdCreadoDto, RegistrarUsuarioDto } from '../dtos/usuario.dto';
import { ListarEstacionesAsignables } from '../queries/impl/listar-estaciones-asignables.query';
import { ListarUsuarios } from '../queries/impl/listar-usuarios.query';
import { ObtenerUsuario } from '../queries/impl/obtener-usuario.query';
import { exigirActor } from './actor';
import {
  RespuestaCorreoDuplicado,
  RespuestaEntradaInvalida,
  RespuestaReglaDeNegocio,
  RespuestasDeSesion,
  RespuestaUsuarioNoExiste,
} from './respuestas-de-error';

const REGLAS_DE_DATOS =
  'ROL_INVALIDO, OPERADOR_SIN_ESTACION, ESTACION_NO_EXISTE, ESTACION_NO_APLICA';

/** Administración de usuarios: solo el administrador. */
@ApiTags('usuarios')
@RespuestasDeSesion()
@Roles('ADMINISTRADOR')
@Controller('usuarios')
export class UsuariosController {
  constructor(
    private readonly comandos: CommandBus,
    private readonly consultas: QueryBus,
  ) {}

  @Get()
  @ApiOkResponse({ type: PaginaDeUsuariosDto })
  @RespuestaEntradaInvalida()
  listar(@Query() filtros: FiltrosDeUsuariosDto): Promise<PaginaDeUsuariosDto> {
    const { pagina, tamano, ...resto } = filtros;
    return this.consultas.execute(new ListarUsuarios(resto, pagina, tamano));
  }

  @Get('estaciones-asignables')
  @ApiOkResponse({ type: [EstacionAsignableDto] })
  listarEstacionesAsignables(): Promise<EstacionAsignableDto[]> {
    return this.consultas.execute(new ListarEstacionesAsignables());
  }

  @Get(':id')
  @ApiOkResponse({ type: UsuarioDetalleDto })
  @RespuestaUsuarioNoExiste()
  obtener(@Param('id', ParseIntPipe) id: number): Promise<UsuarioDetalleDto> {
    return this.consultas.execute(new ObtenerUsuario(id));
  }

  @Post()
  @ApiCreatedResponse({ type: IdCreadoDto })
  @RespuestaEntradaInvalida()
  @RespuestaCorreoDuplicado()
  @RespuestaReglaDeNegocio(`${REGLAS_DE_DATOS} o CONTRASENA_DEBIL.`)
  async registrar(
    @UsuarioActual() usuario: UsuarioSesion | undefined,
    @Body() datos: RegistrarUsuarioDto,
  ): Promise<IdCreadoDto> {
    const id = await this.comandos.execute(
      new RegistrarUsuario(
        datos.nombre,
        datos.correo,
        datos.rol,
        datos.contrasena,
        datos.estacionId ?? null,
        exigirActor(usuario).id,
      ),
    );
    return { id };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Usuario actualizado.' })
  @RespuestaEntradaInvalida()
  @RespuestaUsuarioNoExiste()
  @RespuestaCorreoDuplicado()
  @RespuestaReglaDeNegocio(`${REGLAS_DE_DATOS} o ULTIMO_ADMINISTRADOR.`)
  async editar(
    @UsuarioActual() usuario: UsuarioSesion | undefined,
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: EditarUsuarioDto,
  ): Promise<void> {
    await this.comandos.execute(new EditarUsuario(id, datos, exigirActor(usuario).id));
  }

  @Post(':id/desactivacion')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Usuario desactivado.' })
  @RespuestaUsuarioNoExiste()
  @RespuestaReglaDeNegocio('AUTODESACTIVACION_NO_PERMITIDA o ULTIMO_ADMINISTRADOR.')
  async desactivar(
    @UsuarioActual() usuario: UsuarioSesion | undefined,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.comandos.execute(new DesactivarUsuario(id, exigirActor(usuario).id));
  }

  @Post(':id/reactivacion')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Usuario reactivado.' })
  @RespuestaUsuarioNoExiste()
  async reactivar(
    @UsuarioActual() usuario: UsuarioSesion | undefined,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.comandos.execute(new ReactivarUsuario(id, exigirActor(usuario).id));
  }

  @Put(':id/contrasena')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Contraseña asignada.' })
  @RespuestaEntradaInvalida()
  @RespuestaUsuarioNoExiste()
  @RespuestaReglaDeNegocio('CONTRASENA_DEBIL.')
  async asignarContrasena(
    @UsuarioActual() usuario: UsuarioSesion | undefined,
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: AsignarContrasenaDto,
  ): Promise<void> {
    await this.comandos.execute(
      new AsignarContrasena(id, datos.contrasena, exigirActor(usuario).id),
    );
  }
}
