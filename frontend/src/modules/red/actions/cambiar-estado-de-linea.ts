'use server';

import { z } from 'zod';
import type { EstadoDeAccion } from '@/shared/lib/acciones';
import { cambiarEstadoDeLineaEnBackend } from '../data/lineas';
import { esquemaId } from '../schemas/comunes';
import { esquemaCambioDeEstado } from '../schemas/linea';
import { prepararAccion, responderError } from './comun';
import { invalidarLinea } from './invalidacion';

const esquemaEntrada = z.object({ id: esquemaId, datos: esquemaCambioDeEstado });

/** Se queda en el detalle: al invalidarse, la página muestra el estado nuevo. */
export async function cambiarEstadoDeLinea(id: unknown, entrada: unknown): Promise<EstadoDeAccion> {
  const preparada = await prepararAccion(['SUPERVISOR_MUNICIPAL'], esquemaEntrada, {
    id,
    datos: entrada,
  });
  if (!preparada.ok) {
    return preparada;
  }
  const resultado = await cambiarEstadoDeLineaEnBackend(preparada.datos.id, preparada.datos.datos);
  if (!resultado.ok) {
    return responderError(resultado.error);
  }
  invalidarLinea(preparada.datos.id);
  return { ok: true };
}
