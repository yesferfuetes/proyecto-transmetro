import 'server-only';
import { redirect } from 'next/navigation';
import type { EstadoDeAccion } from '@/shared/lib/acciones';
import type { ErrorDeBackend } from '@/shared/lib/http/resultado';
import { borrarToken } from '@/shared/lib/sesion/cookie';
import type { Rol } from '@/shared/schemas/sesion';

export const SOLO_ADMINISTRADOR: readonly Rol[] = ['ADMINISTRADOR'];

/**
 * Devuelve el error del backend tal cual para que el formulario muestre su mensaje. Si la sesión
 * venció, la cierra y lleva a iniciarla de nuevo.
 */
export async function rechazar(error: ErrorDeBackend): Promise<EstadoDeAccion> {
  if (error.codigo === 'SESION_EXPIRADA') {
    await borrarToken();
    redirect('/login?motivo=expirada');
  }
  return { ok: false, error };
}
