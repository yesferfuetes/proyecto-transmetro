'use server';

import { redirect } from 'next/navigation';
import type { EstadoDeAccion } from '@/shared/lib/acciones';
import { registrarEstacionEnBackend } from '../data/estaciones';
import { esquemaFormularioEstacion } from '../schemas/estacion';
import { prepararAccion, responderError } from './comun';
import { invalidarEstacion } from './invalidacion';

export async function registrarEstacion(entrada: unknown): Promise<EstadoDeAccion> {
  const preparada = await prepararAccion(
    ['SUPERVISOR_MUNICIPAL'],
    esquemaFormularioEstacion,
    entrada,
  );
  if (!preparada.ok) {
    return preparada;
  }
  const resultado = await registrarEstacionEnBackend(preparada.datos);
  if (!resultado.ok) {
    return responderError(resultado.error);
  }
  invalidarEstacion(resultado.datos.id);
  redirect(`/estaciones/${resultado.datos.id}`);
}
