'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { EstadoDeAccion } from '@/shared/lib/acciones';
import { editarPilotoEnBackend } from '../data/pilotos';
import { esquemaId } from '../schemas/comunes';
import { esquemaEdicionDePiloto } from '../schemas/piloto';
import { prepararAccion, responderError } from './comun';
import { invalidarPilotos } from './invalidacion';

const esquemaEntrada = z.object({ id: esquemaId, datos: esquemaEdicionDePiloto });

/** Vuelve a la ficha, que ya muestra el expediente actualizado. */
export async function editarPiloto(id: unknown, entrada: unknown): Promise<EstadoDeAccion> {
  const preparada = await prepararAccion(['SUPERVISOR_MUNICIPAL'], esquemaEntrada, {
    id,
    datos: entrada,
  });
  if (!preparada.ok) {
    return preparada;
  }
  const resultado = await editarPilotoEnBackend(preparada.datos.id, preparada.datos.datos);
  if (!resultado.ok) {
    return responderError(resultado.error);
  }
  invalidarPilotos(preparada.datos.id);
  redirect(`/pilotos/${preparada.datos.id}`);
}
