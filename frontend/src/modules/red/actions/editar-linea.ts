'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { EstadoDeAccion } from '@/shared/lib/acciones';
import { editarLineaEnBackend } from '../data/lineas';
import { esquemaId } from '../schemas/comunes';
import { esquemaFormularioEdicionLinea } from '../schemas/linea';
import { prepararAccion, responderError } from './comun';
import { invalidarLinea } from './invalidacion';

const esquemaEntrada = z.object({ id: esquemaId, datos: esquemaFormularioEdicionLinea });

export async function editarLinea(id: unknown, entrada: unknown): Promise<EstadoDeAccion> {
  const preparada = await prepararAccion(['SUPERVISOR_MUNICIPAL'], esquemaEntrada, {
    id,
    datos: entrada,
  });
  if (!preparada.ok) {
    return preparada;
  }
  const resultado = await editarLineaEnBackend(preparada.datos.id, preparada.datos.datos);
  if (!resultado.ok) {
    return responderError(resultado.error);
  }
  invalidarLinea(preparada.datos.id);
  redirect(`/lineas/${preparada.datos.id}`);
}
