'use server';

import { registrarOcupacionEnBackend } from '../data/alertas';
import type { EstadoDeLectura } from '../types/estado-de-lectura';
import { registrarLectura } from './lectura';

/** Pasajeros a bordo de un bus que llega a la estación. */
export async function registrarOcupacion(entrada: unknown): Promise<EstadoDeLectura> {
  return registrarLectura(entrada, registrarOcupacionEnBackend);
}
