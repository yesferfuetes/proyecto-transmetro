import { UnauthorizedException } from '@nestjs/common';
import type { UsuarioSesion } from '../../shared/auth/usuario-sesion';

/** Id del usuario que ejecuta la acción. El guard global garantiza la sesión en las escrituras. */
export function idDelActor(usuario: UsuarioSesion | undefined): number {
  if (!usuario) {
    throw new UnauthorizedException();
  }
  return usuario.id;
}

/** Solo supervisor y administrador ven el expediente completo; sin sesión, la vista reducida. */
export function veVistaCompleta(usuario: UsuarioSesion | undefined): boolean {
  return usuario?.rol === 'SUPERVISOR_MUNICIPAL' || usuario?.rol === 'ADMINISTRADOR';
}
