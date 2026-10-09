'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { EstadoDeAccion } from '@/shared/lib/acciones';
import { editarParqueoEnBackend } from '../data/parqueos';
import { esquemaId } from '../schemas/comunes';
import { esquemaEdicionDeParqueo } from '../schemas/parqueo';
import { prepararAccion, responderError } from './comun';
import { invalidarFlota } from './invalidacion';

const esquemaEntrada = z.object({ id: esquemaId, datos: esquemaEdicionDeParqueo });

export async function editarParqueo(id: unknown, entrada: unknown): Promise<EstadoDeAccion> {
  const preparada = await prepararAccion(['SUPERVISOR_MUNICIPAL'], esquemaEntrada, {
    id,
    datos: entrada,
  });
  if (!preparada.ok) {
    return preparada;
  }
  const resultado = await editarParqueoEnBackend(preparada.datos.id, preparada.datos.datos);
  if (!resultado.ok) {
    return responderError(resultado.error);
  }
  invalidarFlota();
  redirect('/flota/parqueos');
}
