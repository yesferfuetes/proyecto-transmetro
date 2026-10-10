'use server';

import { redirect } from 'next/navigation';
import type { EstadoDeAccion } from '@/shared/lib/acciones';
import { registrarPilotoEnBackend } from '../data/pilotos';
import { esquemaFormularioPiloto } from '../schemas/piloto';
import { prepararAccion, responderError } from './comun';
import { invalidarPilotos } from './invalidacion';

export async function registrarPiloto(entrada: unknown): Promise<EstadoDeAccion> {
  const preparada = await prepararAccion(
    ['SUPERVISOR_MUNICIPAL'],
    esquemaFormularioPiloto,
    entrada,
  );
  if (!preparada.ok) {
    return preparada;
  }
  const resultado = await registrarPilotoEnBackend(preparada.datos);
  if (!resultado.ok) {
    return responderError(resultado.error);
  }
  invalidarPilotos(resultado.datos.id);
  redirect(`/pilotos/${resultado.datos.id}`);
}
