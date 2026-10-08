'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { EstadoDeAccion } from '@/shared/lib/acciones';
import { editarEstacionEnBackend } from '../data/estaciones';
import { esquemaId } from '../schemas/comunes';
import { esquemaFormularioEdicionEstacion } from '../schemas/estacion';
import { prepararAccion, responderError } from './comun';
import { invalidarEstacion } from './invalidacion';

const esquemaEntrada = z.object({ id: esquemaId, datos: esquemaFormularioEdicionEstacion });

export async function editarEstacion(id: unknown, entrada: unknown): Promise<EstadoDeAccion> {
  const preparada = await prepararAccion(['SUPERVISOR_MUNICIPAL'], esquemaEntrada, {
    id,
    datos: entrada,
  });
  if (!preparada.ok) {
    return preparada;
  }
  const resultado = await editarEstacionEnBackend(preparada.datos.id, preparada.datos.datos);
  if (!resultado.ok) {
    return responderError(resultado.error);
  }
  invalidarEstacion(preparada.datos.id);
  redirect(`/estaciones/${preparada.datos.id}`);
}
