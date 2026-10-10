import 'server-only';
import type { z } from 'zod';
import { solicitarConSesion } from '@/shared/lib/http/cliente-backend';
import type { Resultado } from '@/shared/lib/http/resultado';
import { esquemaCreado } from '../schemas/comunes';
import type { SolicitudDeReporte } from '../schemas/consulta';
import {
  esquemaReporteDeBuses,
  esquemaReporteDeEstaciones,
  esquemaReporteDeLineas,
  type ReporteDeBuses,
  type ReporteDeEstaciones,
  type ReporteDeLineas,
} from '../schemas/reportes';
import { esquemaArchivo, type Archivo } from '../schemas/opciones';
import { rutaConConsulta, TAMANO_DE_PAGINA, TIEMPO_DE_ESPERA_MS } from './parametros';

/** Deja la constancia de la consulta y devuelve su identificador; sin ella no hay reporte. */
export function registrarConsulta(
  solicitud: SolicitudDeReporte,
): Promise<Resultado<{ id: number }>> {
  return solicitarConSesion({
    ruta: '/reportes/consultas',
    metodo: 'POST',
    cuerpo: solicitud,
    esquema: esquemaCreado,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

function leerPagina<T>(
  consultaId: number,
  segmento: string,
  pagina: number,
  esquema: z.ZodType<T>,
): Promise<Resultado<T>> {
  return solicitarConSesion({
    ruta: rutaConConsulta(`/reportes/consultas/${consultaId}/${segmento}`, {
      pagina,
      tamano: TAMANO_DE_PAGINA,
    }),
    esquema,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

export function leerReporteDeEstaciones(
  consultaId: number,
  pagina: number,
): Promise<Resultado<ReporteDeEstaciones>> {
  return leerPagina(consultaId, 'estaciones', pagina, esquemaReporteDeEstaciones);
}

export function leerReporteDeLineas(
  consultaId: number,
  pagina: number,
): Promise<Resultado<ReporteDeLineas>> {
  return leerPagina(consultaId, 'lineas', pagina, esquemaReporteDeLineas);
}

export function leerReporteDeBuses(
  consultaId: number,
  pagina: number,
): Promise<Resultado<ReporteDeBuses>> {
  return leerPagina(consultaId, 'buses', pagina, esquemaReporteDeBuses);
}

/** Todas las filas de la constancia, en CSV. */
export function leerExportacion(consultaId: number): Promise<Resultado<Archivo>> {
  return solicitarConSesion({
    ruta: `/reportes/consultas/${consultaId}/exportacion`,
    esquema: esquemaArchivo,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}
