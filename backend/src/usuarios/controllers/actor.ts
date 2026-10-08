import type { UsuarioSesion } from '../../shared/auth/usuario-sesion';
import { UsuariosError } from '../errors/businessError';

/** El guard deja siempre al usuario en una ruta con sesión; si faltara, no hay sesión. */
export function exigirActor(usuario: UsuarioSesion | undefined): UsuarioSesion {
  if (!usuario) {
    throw new UsuariosError('NO_AUTENTICADO');
  }
  return usuario;
}
