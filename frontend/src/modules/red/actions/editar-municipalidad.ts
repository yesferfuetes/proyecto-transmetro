'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { EstadoDeAccion } from '@/shared/lib/acciones';
import { editarMunicipalidadEnBackend } from '../data/municipalidades';
import { esquemaId } from '../schemas/comunes';
import { esquemaFormularioMunicipalidad } from '../schemas/municipalidad';
import { prepararAccion, responderError } from './comun';
import { invalidarMunicipalidades } from './invalidacion';

const esquemaEntrada = z.object({ id: esquemaId, datos: esquemaFormularioMunicipalidad });

export async function editarMunicipalidad(id: unknown, entrada: unknown): Promise<EstadoDeAccion> {
  const preparada = await prepararAccion(['ADMINISTRADOR'], esquemaEntrada, { id, datos: entrada });
  if (!preparada.ok) {
    return preparada;
  }
  const resultado = await editarMunicipalidadEnBackend(preparada.datos.id, preparada.datos.datos);
  if (!resultado.ok) {
    return responderError(resultado.error);
  }
  invalidarMunicipalidades();
  redirect('/municipalidades');
}
