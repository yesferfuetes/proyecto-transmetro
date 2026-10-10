'use server';

import type { Resultado } from '@/shared/lib/http/resultado';
import { autorizarAccion } from '@/shared/lib/sesion/sesion';
import { leerHuella } from '../data/huella';
import type { Huella } from '../schemas/alerta';

/** Lectura para el sondeo del navegador: pasa por el servidor y exige sesión, sin ruta de API. */
export async function leerHuellaDeAlertas(): Promise<Resultado<Huella>> {
  const autorizacion = await autorizarAccion();
  if (!autorizacion.ok) {
    return autorizacion;
  }
  return leerHuella();
}
