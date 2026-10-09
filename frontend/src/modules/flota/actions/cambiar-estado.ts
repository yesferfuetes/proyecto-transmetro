'use server';

import { z } from 'zod';
import type { EstadoDeAccion } from '@/shared/lib/acciones';
import { cambiarEstadoEnBackend } from '../data/buses';
import { esquemaId } from '../schemas/comunes';
import { esquemaCambioDeEstado } from '../schemas/bus';
import { prepararAccion, responderError } from './comun';
import { invalidarFlota } from './invalidacion';

const esquemaEntrada = z.object({ id: esquemaId, datos: esquemaCambioDeEstado });

/** Se queda en el detalle: al invalidarse, la página muestra el estado nuevo. */
export async function cambiarEstado(id: unknown, entrada: unknown): Promise<EstadoDeAccion> {
  const preparada = await prepararAccion(['SUPERVISOR_MUNICIPAL'], esquemaEntrada, {
    id,
    datos: entrada,
  });
  if (!preparada.ok) {
    return preparada;
  }
  const resultado = await cambiarEstadoEnBackend(preparada.datos.id, preparada.datos.datos);
  if (!resultado.ok) {
    return responderError(resultado.error);
  }
  invalidarFlota(preparada.datos.id);
  return { ok: true };
}
