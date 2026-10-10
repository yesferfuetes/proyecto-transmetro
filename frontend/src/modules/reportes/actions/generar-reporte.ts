'use server';

import { redirect } from 'next/navigation';
import type { EstadoDeAccion } from '@/shared/lib/acciones';
import { registrarConsulta } from '../data/reportes';
import { esquemaSolicitudDeReporte, rutaDelReporte } from '../schemas/consulta';
import { ROLES_DE_REPORTES } from '../schemas/roles';
import { invalidarBitacora, prepararAccion, responderError } from './comun';

/** Deja la constancia y lleva al reporte de esa constancia; solo vuelve si algo falla. */
export async function generarReporte(entrada: unknown): Promise<EstadoDeAccion> {
  const preparada = await prepararAccion(ROLES_DE_REPORTES, esquemaSolicitudDeReporte, entrada);
  if (!preparada.ok) {
    return preparada;
  }
  const resultado = await registrarConsulta(preparada.datos);
  if (!resultado.ok) {
    return responderError(resultado.error);
  }
  invalidarBitacora();
  redirect(rutaDelReporte(preparada.datos.tipo, resultado.datos.id));
}
