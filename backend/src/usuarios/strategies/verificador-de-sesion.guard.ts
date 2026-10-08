import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { QueryBus } from '@nestjs/cqrs';
import type { Request } from 'express';
import {
  METADATO_PUBLICO,
  METADATO_ROLES,
  SolicitudConSesion,
} from '../../shared/auth/decoradores';
import type { Rol } from '../../shared/auth/rol';
import type { UsuarioSesion } from '../../shared/auth/usuario-sesion';
import { UsuariosError } from '../errors/businessError';
import { ObtenerUsuarioDeSesion } from '../queries/impl/obtener-usuario-de-sesion.query';
import { EmisorDeTokens } from '../services/emisor-de-tokens.service';

type Solicitud = Request & SolicitudConSesion;

const ENCABEZADO_BEARER = /^Bearer\s+(\S+)$/i;

/**
 * Guard global: toda solicitud exige una sesión vigente salvo los endpoints `@Publico()`. Lee el
 * usuario de la base en cada solicitud, así una desactivación o un cambio de rol rigen de inmediato.
 */
@Injectable()
export class VerificadorDeSesionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly emisor: EmisorDeTokens,
    private readonly consultas: QueryBus,
  ) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    if (this.esPublico(contexto)) {
      return true;
    }
    const solicitud = contexto.switchToHttp().getRequest<Solicitud>();
    const usuarioId = this.verificarToken(this.leerToken(solicitud));
    const usuario = await this.consultas.execute(new ObtenerUsuarioDeSesion(usuarioId));
    if (!usuario) {
      throw new UsuariosError('SESION_EXPIRADA');
    }
    solicitud.usuario = usuario;
    this.exigirRol(contexto, usuario);
    return true;
  }

  private esPublico(contexto: ExecutionContext): boolean {
    return (
      this.reflector.getAllAndOverride<boolean | undefined>(METADATO_PUBLICO, [
        contexto.getHandler(),
        contexto.getClass(),
      ]) === true
    );
  }

  private leerToken(solicitud: Solicitud): string {
    const coincidencia = ENCABEZADO_BEARER.exec(solicitud.headers.authorization ?? '');
    if (!coincidencia?.[1]) {
      throw new UsuariosError('NO_AUTENTICADO');
    }
    return coincidencia[1];
  }

  private verificarToken(token: string): number {
    const resultado = this.emisor.verificar(token);
    if (resultado === 'vencido') {
      throw new UsuariosError('SESION_EXPIRADA');
    }
    if (resultado === 'invalido') {
      throw new UsuariosError('NO_AUTENTICADO');
    }
    return resultado.usuarioId;
  }

  private exigirRol(contexto: ExecutionContext, usuario: UsuarioSesion): void {
    const roles = this.reflector.getAllAndOverride<Rol[] | undefined>(METADATO_ROLES, [
      contexto.getHandler(),
      contexto.getClass(),
    ]);
    if (roles && roles.length > 0 && !roles.includes(usuario.rol)) {
      throw new UsuariosError('ACCESO_DENEGADO');
    }
  }
}
