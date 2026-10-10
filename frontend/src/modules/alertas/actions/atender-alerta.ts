'use server';

import type { EstadoDeAccion } from '@/shared/lib/acciones';
import { atenderEnBackend } from '../data/alertas';
import { esquemaId } from '../schemas/comunes';
import { prepararAccion, responderError } from './comun';
import { invalidarAlertas } from './invalidacion';

/** Marca la alerta como atendida; al invalidarse, la lista la muestra atendida. */
export async function atenderAlerta(id: unknown): Promise<EstadoDeAccion> {
  const preparada = await prepararAccion(['OPERADOR_ESTACION'], esquemaId, id);
  if (!preparada.ok) {
    return preparada;
  }
  const resultado = await atenderEnBackend(preparada.datos.datos);
  if (!resultado.ok) {
    return responderError(resultado.error);
  }
  invalidarAlertas();
  return { ok: true };
}
