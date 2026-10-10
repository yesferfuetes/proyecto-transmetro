'use server';

import { z } from 'zod';
import type { EstadoDeAccion } from '@/shared/lib/acciones';
import { cambiarBusEnBackend } from '../data/pilotos';
import { esquemaId } from '../schemas/comunes';
import { esquemaCambioDeBus } from '../schemas/piloto';
import { prepararAccion, responderError } from './comun';
import { invalidarPilotos } from './invalidacion';

const esquemaEntrada = z.object({ id: esquemaId, datos: esquemaCambioDeBus });

/** Se queda en la ficha: al invalidarse, la página muestra el bus y la línea nuevos. */
export async function cambiarBusDePiloto(id: unknown, entrada: unknown): Promise<EstadoDeAccion> {
  const preparada = await prepararAccion(['SUPERVISOR_MUNICIPAL'], esquemaEntrada, {
    id,
    datos: entrada,
  });
  if (!preparada.ok) {
    return preparada;
  }
  const resultado = await cambiarBusEnBackend(preparada.datos.id, preparada.datos.datos);
  if (!resultado.ok) {
    return responderError(resultado.error);
  }
  invalidarPilotos(preparada.datos.id);
  return { ok: true };
}
