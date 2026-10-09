import { UnauthorizedException } from '@nestjs/common';
import type { UsuarioSesion } from '../../shared/auth/usuario-sesion';

/** Id del usuario que ejecuta la acción. El guard global garantiza la sesión en las escrituras. */
export function idDelActor(usuario: UsuarioSesion | undefined): number {
  if (!usuario) {
    throw new UnauthorizedException();
  }
  return usuario.id;
}
