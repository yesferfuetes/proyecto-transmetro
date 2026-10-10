import 'server-only';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import type { z } from 'zod';
import { errorDeEntrada } from '@/shared/lib/acciones';
import type { ErrorDeBackend, Resultado } from '@/shared/lib/http/resultado';
import { borrarToken } from '@/shared/lib/sesion/cookie';
import { autorizarAccion } from '@/shared/lib/sesion/sesion';
import type { Rol } from '@/shared/schemas/sesion';

/**
 * Primer paso de toda acción de reportes: verifica el rol y valida la entrada. Si algo falla,
 * devuelve el error sin llamar al backend.
 */
export async function prepararAccion<T>(
  roles: readonly Rol[],
  esquema: z.ZodType<T>,
  entrada: unknown,
): Promise<Resultado<T>> {
  const autorizacion = await autorizarAccion(roles);
  if (!autorizacion.ok) {
    return autorizacion;
  }
  const validacion = esquema.safeParse(entrada);
  return validacion.success
    ? { ok: true, datos: validacion.data }
    : errorDeEntrada(validacion.error);
}

/** Devuelve el error del backend tal cual; con la sesión vencida, la cierra y lleva a iniciarla. */
export async function responderError(
  error: ErrorDeBackend,
): Promise<{ ok: false; error: ErrorDeBackend }> {
  if (error.codigo === 'SESION_EXPIRADA') {
    await borrarToken();
    redirect('/login?motivo=expirada');
  }
  return { ok: false, error };
}

/** Cada reporte entregado deja una constancia nueva: la bitácora debe leerse de nuevo. */
export function invalidarBitacora(): void {
  revalidatePath('/reportes/bitacora');
}
