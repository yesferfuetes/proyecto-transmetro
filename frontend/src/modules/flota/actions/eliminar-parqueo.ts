'use server';

import type { EstadoDeAccion } from '@/shared/lib/acciones';
import { eliminarParqueoEnBackend } from '../data/parqueos';
import { esquemaId } from '../schemas/comunes';
import { prepararAccion, responderError } from './comun';
import { invalidarFlota } from './invalidacion';

/** Se queda en el listado: al invalidarse, el parqueo desaparece de la tabla. */
export async function eliminarParqueo(id: unknown): Promise<EstadoDeAccion> {
  const preparada = await prepararAccion(['SUPERVISOR_MUNICIPAL'], esquemaId, id);
  if (!preparada.ok) {
    return preparada;
  }
  const resultado = await eliminarParqueoEnBackend(preparada.datos);
  if (!resultado.ok) {
    return responderError(resultado.error);
  }
  invalidarFlota();
  return { ok: true };
}
