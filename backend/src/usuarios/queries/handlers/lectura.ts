import { esRol, Rol } from '../../../shared/auth/rol';
import type { EstacionResumen } from '../../../shared/contratos/red';
import type { Usuario } from '../../entities/usuario.entity';
import type { EstacionAsignable } from '../impl/vistas';

export function aEstacionAsignable({ id, codigo, nombre }: EstacionResumen): EstacionAsignable {
  return { id, codigo, nombre };
}

/** El rol guardado siempre es uno de los tres; si no lo fuera, es un dato corrupto. */
export function leerRol(usuario: Usuario): Rol {
  if (!esRol(usuario.rol)) {
    throw new Error(`El usuario ${usuario.id} tiene un rol desconocido.`);
  }
  return usuario.rol;
}
