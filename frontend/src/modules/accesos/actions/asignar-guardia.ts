'use server';

import { z } from 'zod';
import type { EstadoDeAccion } from '@/shared/lib/acciones';
import { asignarGuardiaEnBackend } from '../data/accesos';
import { esquemaFormularioAsignacion } from '../schemas/acceso';
import { esquemaId } from '../schemas/comunes';
import { prepararAccion, responderError } from './comun';
import { invalidarAcceso } from './invalidacion';

const esquemaEntrada = z.object({ accesoId: esquemaId, datos: esquemaFormularioAsignacion });

export async function asignarGuardia(accesoId: unknown, entrada: unknown): Promise<EstadoDeAccion> {
  const preparada = await prepararAccion(['SUPERVISOR_MUNICIPAL'], esquemaEntrada, {
    accesoId,
    datos: entrada,
  });
  if (!preparada.ok) {
    return preparada;
  }
  const resultado = await asignarGuardiaEnBackend(preparada.datos.accesoId, preparada.datos.datos);
  if (!resultado.ok) {
    return responderError(resultado.error);
  }
  invalidarAcceso(preparada.datos.accesoId);
  return { ok: true };
}
