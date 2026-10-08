import type { Repository } from 'typeorm';
import { esRol, Rol } from '../../../shared/auth/rol';
import { Usuario } from '../../entities/usuario.entity';
import { UsuariosError } from '../../errors/businessError';
import type { RedAdapter } from '../../infrastructure/adapters/red.adapter';

const LARGO_MINIMO_DE_CONTRASENA = 8;

/** El correo se guarda y se busca sin espacios a los lados y en minúsculas. */
export function normalizarCorreo(correo: string): string {
  return correo.trim().toLowerCase();
}

export function exigirRol(valor: string): Rol {
  if (!esRol(valor)) {
    throw new UsuariosError('ROL_INVALIDO');
  }
  return valor;
}

/** Al menos 8 caracteres, con al menos una letra y un número. */
export function exigirContrasenaFuerte(contrasena: string): void {
  const valida =
    [...contrasena].length >= LARGO_MINIMO_DE_CONTRASENA &&
    /\p{L}/u.test(contrasena) &&
    /\p{Nd}/u.test(contrasena);
  if (!valida) {
    throw new UsuariosError('CONTRASENA_DEBIL');
  }
}

/**
 * Devuelve la estación que corresponde al rol: la indicada, que debe existir, para un operador de
 * estación; ninguna para los demás roles.
 */
export async function resolverEstacion(
  rol: Rol,
  estacionId: number | null,
  red: RedAdapter,
): Promise<number | null> {
  if (rol !== 'OPERADOR_ESTACION') {
    if (estacionId !== null) {
      throw new UsuariosError('ESTACION_NO_APLICA');
    }
    return null;
  }
  if (estacionId === null) {
    throw new UsuariosError('OPERADOR_SIN_ESTACION');
  }
  if ((await red.obtenerEstacion(estacionId)) === null) {
    throw new UsuariosError('ESTACION_NO_EXISTE');
  }
  return estacionId;
}

/** El correo no puede pertenecer a otro usuario, activo o inactivo. */
export async function exigirCorreoLibre(
  repositorio: Repository<Usuario>,
  correo: string,
  idPropio: number | null,
): Promise<void> {
  const existente = await repositorio.findOneBy({ email: correo });
  if (existente && existente.id !== idPropio) {
    throw new UsuariosError('EMAIL_DUPLICADO');
  }
}

export async function buscarUsuario(
  repositorio: Repository<Usuario>,
  id: number,
): Promise<Usuario> {
  const usuario = await repositorio.findOneBy({ id });
  if (!usuario) {
    throw new UsuariosError('USUARIO_NO_EXISTE');
  }
  return usuario;
}

/**
 * Exige que quede otro administrador activo además de `idQueDejaDeContar`. Bloquea las filas de los
 * administradores activos para que dos cambios simultáneos no dejen al sistema sin ninguno.
 */
export async function exigirOtroAdministradorActivo(
  repositorio: Repository<Usuario>,
  idQueDejaDeContar: number,
): Promise<void> {
  const administradores = await repositorio.find({
    select: { id: true },
    where: { rol: 'ADMINISTRADOR', activo: true },
    lock: { mode: 'pessimistic_write' },
  });
  if (!administradores.some((administrador) => administrador.id !== idQueDejaDeContar)) {
    throw new UsuariosError('ULTIMO_ADMINISTRADOR');
  }
}

/** Indica si el usuario es hoy un administrador activo, es decir, si cuenta para la regla anterior. */
export function esAdministradorActivo(usuario: Usuario): boolean {
  return usuario.rol === 'ADMINISTRADOR' && usuario.activo;
}
