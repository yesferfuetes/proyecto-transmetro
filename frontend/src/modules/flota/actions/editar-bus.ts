'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { EstadoDeAccion } from '@/shared/lib/acciones';
import { editarBusEnBackend } from '../data/buses';
import { esquemaId } from '../schemas/comunes';
import { esquemaEdicionDeBus } from '../schemas/bus';
import { prepararAccion, responderError } from './comun';
import { invalidarFlota } from './invalidacion';

const esquemaEntrada = z.object({ id: esquemaId, datos: esquemaEdicionDeBus });

/** Vuelve al detalle, que ya muestra la capacidad nueva. */
export async function editarBus(id: unknown, entrada: unknown): Promise<EstadoDeAccion> {
  const preparada = await prepararAccion(['SUPERVISOR_MUNICIPAL'], esquemaEntrada, {
    id,
    datos: entrada,
  });
  if (!preparada.ok) {
    return preparada;
  }
  const resultado = await editarBusEnBackend(preparada.datos.id, preparada.datos.datos);
  if (!resultado.ok) {
    return responderError(resultado.error);
  }
  invalidarFlota(preparada.datos.id);
  redirect(`/flota/${preparada.datos.id}`);
}
