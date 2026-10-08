'use server';

import { redirect } from 'next/navigation';
import type { EstadoDeAccion } from '@/shared/lib/acciones';
import { registrarLineaEnBackend } from '../data/lineas';
import { esquemaFormularioLinea } from '../schemas/linea';
import { prepararAccion, responderError } from './comun';
import { invalidarLinea } from './invalidacion';

export async function registrarLinea(entrada: unknown): Promise<EstadoDeAccion> {
  const preparada = await prepararAccion(['SUPERVISOR_MUNICIPAL'], esquemaFormularioLinea, entrada);
  if (!preparada.ok) {
    return preparada;
  }
  const resultado = await registrarLineaEnBackend(preparada.datos);
  if (!resultado.ok) {
    return responderError(resultado.error);
  }
  invalidarLinea(resultado.datos.id);
  redirect(`/lineas/${resultado.datos.id}`);
}
