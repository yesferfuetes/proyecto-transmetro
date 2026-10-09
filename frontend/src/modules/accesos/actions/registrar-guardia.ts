'use server';

import { redirect } from 'next/navigation';
import type { EstadoDeAccion } from '@/shared/lib/acciones';
import { registrarGuardiaEnBackend } from '../data/guardias';
import { esquemaFormularioGuardia } from '../schemas/guardia';
import { prepararAccion, responderError } from './comun';
import { invalidarGuardias } from './invalidacion';

export async function registrarGuardia(entrada: unknown): Promise<EstadoDeAccion> {
  const preparada = await prepararAccion(
    ['SUPERVISOR_MUNICIPAL'],
    esquemaFormularioGuardia,
    entrada,
  );
  if (!preparada.ok) {
    return preparada;
  }
  const resultado = await registrarGuardiaEnBackend(preparada.datos);
  if (!resultado.ok) {
    return responderError(resultado.error);
  }
  invalidarGuardias();
  redirect('/guardias');
}
