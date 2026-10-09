'use server';

import { z } from 'zod';
import type { EstadoDeAccion } from '@/shared/lib/acciones';
import { editarAccesoEnBackend } from '../data/accesos';
import { esquemaFormularioEdicionAcceso } from '../schemas/acceso';
import { esquemaId } from '../schemas/comunes';
import { prepararAccion, responderError } from './comun';
import { invalidarAcceso } from './invalidacion';

const esquemaEntrada = z.object({ id: esquemaId, datos: esquemaFormularioEdicionAcceso });

export async function editarAcceso(id: unknown, entrada: unknown): Promise<EstadoDeAccion> {
  const preparada = await prepararAccion(['SUPERVISOR_MUNICIPAL'], esquemaEntrada, {
    id,
    datos: entrada,
  });
  if (!preparada.ok) {
    return preparada;
  }
  const resultado = await editarAccesoEnBackend(preparada.datos.id, preparada.datos.datos);
  if (!resultado.ok) {
    return responderError(resultado.error);
  }
  invalidarAcceso(preparada.datos.id);
  return { ok: true };
}
