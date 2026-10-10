'use server';

import { registrarDemandaEnBackend } from '../data/alertas';
import type { EstadoDeLectura } from '../types/estado-de-lectura';
import { registrarLectura } from './lectura';

/** Pasajeros esperando en la estación para un bus que llega. */
export async function registrarDemanda(entrada: unknown): Promise<EstadoDeLectura> {
  return registrarLectura(entrada, registrarDemandaEnBackend);
}
