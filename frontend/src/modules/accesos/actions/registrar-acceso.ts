'use server';

import { redirect } from 'next/navigation';
import type { EstadoDeAccion } from '@/shared/lib/acciones';
import { registrarAccesoEnBackend } from '../data/accesos';
import { esquemaFormularioAcceso } from '../schemas/acceso';
import { prepararAccion, responderError } from './comun';
import { invalidarAcceso } from './invalidacion';

export async function registrarAcceso(entrada: unknown): Promise<EstadoDeAccion> {
  const preparada = await prepararAccion(
    ['SUPERVISOR_MUNICIPAL'],
    esquemaFormularioAcceso,
    entrada,
  );
  if (!preparada.ok) {
    return preparada;
  }
  const resultado = await registrarAccesoEnBackend(preparada.datos);
  if (!resultado.ok) {
    return responderError(resultado.error);
  }
  invalidarAcceso(resultado.datos.id);
  redirect(`/accesos/${resultado.datos.id}`);
}
