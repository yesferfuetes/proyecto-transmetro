'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { EstadoDeAccion } from '@/shared/lib/acciones';
import { definirRecorridoEnBackend } from '../data/lineas';
import { esquemaId } from '../schemas/comunes';
import { esquemaFormularioRecorrido } from '../schemas/recorrido';
import { prepararAccion, responderError } from './comun';
import { invalidarLinea } from './invalidacion';

const esquemaEntrada = z.object({ id: esquemaId, datos: esquemaFormularioRecorrido });

export async function definirRecorrido(id: unknown, entrada: unknown): Promise<EstadoDeAccion> {
  const preparada = await prepararAccion(['SUPERVISOR_MUNICIPAL'], esquemaEntrada, {
    id,
    datos: entrada,
  });
  if (!preparada.ok) {
    return preparada;
  }
  const resultado = await definirRecorridoEnBackend(preparada.datos.id, preparada.datos.datos);
  if (!resultado.ok) {
    return responderError(resultado.error);
  }
  invalidarLinea(preparada.datos.id);
  // Las estaciones muestran por qué líneas pasan y si quedaron "sin línea".
  revalidatePath('/estaciones');
  redirect(`/lineas/${preparada.datos.id}`);
}
