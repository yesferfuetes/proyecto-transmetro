import 'server-only';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { solicitar } from '@/shared/lib/http/cliente-backend';
import type { ErrorDeBackend, Resultado } from '@/shared/lib/http/resultado';
import { esquemaSesion, type Rol, type Sesion } from '@/shared/schemas/sesion';
import { leerToken } from './cookie';

/** Códigos con los que el backend dice que no hay una sesión vigente. */
const SIN_SESION = new Set(['NO_AUTENTICADO', 'SESION_EXPIRADA']);

type Consulta = Readonly<{ sesion: Sesion | null; habiaToken: boolean }>;

/**
 * Lee la cuenta del token una sola vez por solicitud. Si el backend no responde, el error sube al
 * `error.tsx` del segmento: no se confunde con una sesión vencida.
 */
const consultarSesion = cache(async (): Promise<Consulta> => {
  const token = await leerToken();
  if (token === undefined) {
    return { sesion: null, habiaToken: false };
  }
  const resultado = await solicitar({ ruta: '/usuarios/yo', esquema: esquemaSesion, token });
  if (resultado.ok) {
    return { sesion: resultado.datos, habiaToken: true };
  }
  if (SIN_SESION.has(resultado.error.codigo)) {
    return { sesion: null, habiaToken: true };
  }
  throw new Error(`No fue posible leer la sesión: ${resultado.error.codigo}`);
});

export async function obtenerSesion(): Promise<Sesion | null> {
  return (await consultarSesion()).sesion;
}

function rolPermitido(sesion: Sesion, roles?: readonly Rol[]): boolean {
  return roles === undefined || roles.includes(sesion.rol);
}

/** Para layouts y páginas: sin sesión lleva a iniciarla; con un rol no permitido, a acceso denegado. */
export async function exigirSesion(roles?: readonly Rol[]): Promise<Sesion> {
  const { sesion, habiaToken } = await consultarSesion();
  if (sesion === null) {
    redirect(habiaToken ? '/login?motivo=expirada' : '/login');
  }
  if (!rolPermitido(sesion, roles)) {
    redirect('/acceso-denegado');
  }
  return sesion;
}

const NO_AUTENTICADO: ErrorDeBackend = {
  codigo: 'NO_AUTENTICADO',
  mensaje: 'Tu sesión no está activa. Inicia sesión de nuevo.',
  detalles: [],
  estado: 401,
};

const ACCESO_DENEGADO: ErrorDeBackend = {
  codigo: 'ACCESO_DENEGADO',
  mensaje: 'Tu rol no tiene permiso para esta acción.',
  detalles: [],
  estado: 403,
};

/** Para acciones de servidor: lo mismo que `exigirSesion`, pero devuelve el error sin redirigir. */
export async function autorizarAccion(roles?: readonly Rol[]): Promise<Resultado<Sesion>> {
  const sesion = await obtenerSesion();
  if (sesion === null) {
    return { ok: false, error: NO_AUTENTICADO };
  }
  if (!rolPermitido(sesion, roles)) {
    return { ok: false, error: ACCESO_DENEGADO };
  }
  return { ok: true, datos: sesion };
}
