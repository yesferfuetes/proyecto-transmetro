import 'server-only';
import { cookies } from 'next/headers';
import { NOMBRE_COOKIE_SESION } from './nombre-cookie';

export { NOMBRE_COOKIE_SESION };

/** Duración de la sesión que emite el backend. */
export const DURACION_SESION_SEGUNDOS = 8 * 60 * 60;

export async function leerToken(): Promise<string | undefined> {
  const almacen = await cookies();
  return almacen.get(NOMBRE_COOKIE_SESION)?.value;
}

/** Guarda el token hasta su vencimiento, sin pasar de la duración de la sesión. */
export async function guardarToken(token: string, expiraEn: string): Promise<void> {
  const restante = Math.floor((Date.parse(expiraEn) - Date.now()) / 1000);
  const maxAge = Number.isFinite(restante)
    ? Math.max(0, Math.min(restante, DURACION_SESION_SEGUNDOS))
    : DURACION_SESION_SEGUNDOS;
  const almacen = await cookies();
  almacen.set(NOMBRE_COOKIE_SESION, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  });
}

export async function borrarToken(): Promise<void> {
  const almacen = await cookies();
  almacen.delete(NOMBRE_COOKIE_SESION);
}
