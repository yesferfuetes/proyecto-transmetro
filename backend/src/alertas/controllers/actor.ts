import { UnauthorizedException } from '@nestjs/common';
import type { UsuarioSesion } from '../../shared/auth/usuario-sesion';
import { EstacionAjena } from '../errors/errores-de-alertas';

/** El guard global garantiza la sesión; sin ella no hay actor. */
export function exigirSesion(usuario: UsuarioSesion | undefined): UsuarioSesion {
  if (!usuario) {
    throw new UnauthorizedException();
  }
  return usuario;
}

/**
 * Estación a la que se limita una consulta: la de la sesión para el operador, sin importar lo
 * que pida el cliente; la pedida (o ninguna) para supervisor y administrador.
 */
export function alcanceDeEstacion(
  usuario: UsuarioSesion | undefined,
  pedida: number | undefined,
): number | undefined {
  const sesion = exigirSesion(usuario);
  if (sesion.rol !== 'OPERADOR_ESTACION') {
    return pedida;
  }
  if (sesion.estacionId === null) {
    throw new EstacionAjena();
  }
  return sesion.estacionId;
}
