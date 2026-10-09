'use server';

import { redirect } from 'next/navigation';
import type { EstadoDeAccion } from '@/shared/lib/acciones';
import { registrarParqueoEnBackend } from '../data/parqueos';
import { esquemaFormularioParqueo } from '../schemas/parqueo';
import { prepararAccion, responderError } from './comun';
import { invalidarFlota } from './invalidacion';

export async function registrarParqueo(entrada: unknown): Promise<EstadoDeAccion> {
  const preparada = await prepararAccion(
    ['SUPERVISOR_MUNICIPAL'],
    esquemaFormularioParqueo,
    entrada,
  );
  if (!preparada.ok) {
    return preparada;
  }
  const resultado = await registrarParqueoEnBackend(preparada.datos);
  if (!resultado.ok) {
    return responderError(resultado.error);
  }
  invalidarFlota();
  redirect('/flota/parqueos');
}
