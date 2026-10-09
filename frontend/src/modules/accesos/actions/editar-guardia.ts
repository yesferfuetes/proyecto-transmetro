'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { EstadoDeAccion } from '@/shared/lib/acciones';
import { editarGuardiaEnBackend } from '../data/guardias';
import { esquemaId } from '../schemas/comunes';
import { esquemaFormularioGuardia } from '../schemas/guardia';
import { prepararAccion, responderError } from './comun';
import { invalidarGuardias } from './invalidacion';

const esquemaEntrada = z.object({ id: esquemaId, datos: esquemaFormularioGuardia });

export async function editarGuardia(id: unknown, entrada: unknown): Promise<EstadoDeAccion> {
  const preparada = await prepararAccion(['SUPERVISOR_MUNICIPAL'], esquemaEntrada, {
    id,
    datos: entrada,
  });
  if (!preparada.ok) {
    return preparada;
  }
  const resultado = await editarGuardiaEnBackend(preparada.datos.id, preparada.datos.datos);
  if (!resultado.ok) {
    return responderError(resultado.error);
  }
  invalidarGuardias();
  redirect('/guardias');
}
