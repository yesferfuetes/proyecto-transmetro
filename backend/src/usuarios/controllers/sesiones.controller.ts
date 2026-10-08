import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Publico } from '../../shared/auth/decoradores';
import { SobreDeError } from '../../shared/errors/sobre-de-error';
import { IniciarSesion } from '../commands/impl/iniciar-sesion.command';
import { IniciarSesionDto, TokenDeSesionDto } from '../dtos/sesion.dto';
import { EmisorDeTokens } from '../services/emisor-de-tokens.service';
import { RespuestaEntradaInvalida } from './respuestas-de-error';

@ApiTags('sesiones')
@Controller('sesiones')
export class SesionesController {
  constructor(
    private readonly comandos: CommandBus,
    private readonly emisor: EmisorDeTokens,
  ) {}

  @Post()
  @Publico()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: TokenDeSesionDto, description: 'Sesión abierta por 8 horas.' })
  @ApiUnauthorizedResponse({
    type: SobreDeError,
    description: 'CREDENCIALES_INVALIDAS o USUARIO_INACTIVO.',
  })
  @RespuestaEntradaInvalida()
  async iniciar(@Body() datos: IniciarSesionDto): Promise<TokenDeSesionDto> {
    const usuarioId = await this.comandos.execute(
      new IniciarSesion(datos.correo, datos.contrasena),
    );
    const { token, expiraEn } = this.emisor.emitir(usuarioId);
    return { token, expiraEn: expiraEn.toISOString() };
  }
}
