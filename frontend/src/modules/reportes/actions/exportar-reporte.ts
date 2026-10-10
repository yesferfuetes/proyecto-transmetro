'use server';

import type { ErrorDeBackend } from '@/shared/lib/http/resultado';
import { leerExportacion, registrarConsulta } from '../data/reportes';
import { esquemaSolicitudDeReporte } from '../schemas/consulta';
import type { Archivo } from '../schemas/opciones';
import { ROLES_DE_REPORTES } from '../schemas/roles';
import { invalidarBitacora, prepararAccion, responderError } from './comun';

export type ResultadoDeExportacion =
  { ok: true; archivo: Archivo } | { ok: false; error: ErrorDeBackend };

/**
 * Exportar es una consulta más: deja una constancia nueva con el mismo tipo y filtros y entrega
 * todas las filas, no solo la página que se ve.
 */
export async function exportarReporte(entrada: unknown): Promise<ResultadoDeExportacion> {
  const preparada = await prepararAccion(ROLES_DE_REPORTES, esquemaSolicitudDeReporte, entrada);
  if (!preparada.ok) {
    return preparada;
  }
  const consulta = await registrarConsulta(preparada.datos);
  if (!consulta.ok) {
    return responderError(consulta.error);
  }
  const exportacion = await leerExportacion(consulta.datos.id);
  if (!exportacion.ok) {
    return responderError(exportacion.error);
  }
  invalidarBitacora();
  return { ok: true, archivo: exportacion.datos };
}
