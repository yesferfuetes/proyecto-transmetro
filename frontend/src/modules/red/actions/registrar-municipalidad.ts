'use server';

import { redirect } from 'next/navigation';
import type { EstadoDeAccion } from '@/shared/lib/acciones';
import { registrarMunicipalidadEnBackend } from '../data/municipalidades';
import { esquemaFormularioMunicipalidad } from '../schemas/municipalidad';
import { prepararAccion, responderError } from './comun';
import { invalidarMunicipalidades } from './invalidacion';

export async function registrarMunicipalidad(entrada: unknown): Promise<EstadoDeAccion> {
  const preparada = await prepararAccion(
    ['ADMINISTRADOR'],
    esquemaFormularioMunicipalidad,
    entrada,
  );
  if (!preparada.ok) {
    return preparada;
  }
  const resultado = await registrarMunicipalidadEnBackend(preparada.datos);
  if (!resultado.ok) {
    return responderError(resultado.error);
  }
  invalidarMunicipalidades();
  redirect('/municipalidades');
}
