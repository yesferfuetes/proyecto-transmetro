import { Body, Controller, Get, HttpCode, HttpStatus, Put } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UsuarioActual } from '../../shared/auth/decoradores';
import type { UsuarioSesion } from '../../shared/auth/usuario-sesion';
import { SobreDeError } from '../../shared/errors/sobre-de-error';
import { CambiarMiContrasena } from '../commands/impl/cambiar-mi-contrasena.command';
import { MiCuentaDto } from '../dtos/consultas.dto';
import { CambiarMiContrasenaDto } from '../dtos/contrasenas.dto';
import { ObtenerMiCuenta } from '../queries/impl/obtener-mi-cuenta.query';
import { exigirActor } from './actor';
import {
  RespuestaEntradaInvalida,
  RespuestaReglaDeNegocio,
  RespuestasDeSesion,
} from './respuestas-de-error';

/** Cuenta del usuario de la sesión. Se registra antes que las rutas `/usuarios/:id`. */
@ApiTags('usuarios')
@RespuestasDeSesion()
@Controller('usuarios/yo')
export class MiCuentaController {
  constructor(
    private readonly comandos: CommandBus,
    private readonly consultas: QueryBus,
  ) {}

  @Get()
  @ApiOkResponse({ type: MiCuentaDto })
  obtener(@UsuarioActual() usuario: UsuarioSesion | undefined): Promise<MiCuentaDto> {
    return this.consultas.execute(new ObtenerMiCuenta(exigirActor(usuario).id));
  }

  @Put('contrasena')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Contraseña cambiada.' })
  @RespuestaEntradaInvalida()
  @RespuestaReglaDeNegocio('CONTRASENA_DEBIL.')
  @ApiUnauthorizedResponse({
    type: SobreDeError,
    description: 'CREDENCIALES_INVALIDAS si la contraseña actual no es correcta.',
  })
  async cambiarContrasena(
    @UsuarioActual() usuario: UsuarioSesion | undefined,
    @Body() datos: CambiarMiContrasenaDto,
  ): Promise<void> {
    await this.comandos.execute(
      new CambiarMiContrasena(
        exigirActor(usuario).id,
        datos.contrasenaActual,
        datos.contrasenaNueva,
      ),
    );
  }
}
