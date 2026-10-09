'use server';

import { redirect } from 'next/navigation';
import type { EstadoDeAccion } from '@/shared/lib/acciones';
import { registrarBusEnBackend } from '../data/buses';
import { esquemaFormularioBus } from '../schemas/bus';
import { prepararAccion, responderError } from './comun';
import { invalidarFlota } from './invalidacion';

export async function registrarBus(entrada: unknown): Promise<EstadoDeAccion> {
  const preparada = await prepararAccion(['SUPERVISOR_MUNICIPAL'], esquemaFormularioBus, entrada);
  if (!preparada.ok) {
    return preparada;
  }
  const resultado = await registrarBusEnBackend(preparada.datos);
  if (!resultado.ok) {
    return responderError(resultado.error);
  }
  invalidarFlota(resultado.datos.id);
  redirect(`/flota/${resultado.datos.id}`);
}
