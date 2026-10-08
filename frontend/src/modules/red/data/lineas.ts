import 'server-only';
import { solicitarConSesion } from '@/shared/lib/http/cliente-backend';
import type { Resultado } from '@/shared/lib/http/resultado';
import { esquemaCreado, esquemaSinContenido } from '../schemas/comunes';
import {
  esquemaLineaDetalle,
  esquemaPaginaLineas,
  type CambioDeEstado,
  type FiltrosLineas,
  type FormularioEdicionLinea,
  type FormularioLinea,
  type LineaDetalle,
  type PaginaLineas,
} from '../schemas/linea';
import type { FormularioRecorrido } from '../schemas/recorrido';
import {
  rutaConConsulta,
  TAMANO_DE_PAGINA,
  TAMANO_MAXIMO,
  TIEMPO_DE_ESPERA_MS,
} from './parametros';

type ConsultaDeLineas = Partial<FiltrosLineas> & Readonly<{ estacionId?: number; tamano?: number }>;

export function listarLineas(consulta: ConsultaDeLineas): Promise<Resultado<PaginaLineas>> {
  return solicitarConSesion({
    ruta: rutaConConsulta('/lineas', {
      municipalidadId: consulta.municipalidadId,
      estado: consulta.estado,
      estacionId: consulta.estacionId,
      pagina: consulta.pagina ?? 1,
      tamano: consulta.tamano ?? TAMANO_DE_PAGINA,
    }),
    esquema: esquemaPaginaLineas,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

/** Ids de las líneas que pasan por una estación; sirve para resaltarlas al operador. */
export async function idsDeLineasDeEstacion(estacionId: number): Promise<Resultado<number[]>> {
  const resultado = await listarLineas({ estacionId, tamano: TAMANO_MAXIMO });
  return resultado.ok
    ? { ok: true, datos: resultado.datos.elementos.map((linea) => linea.id) }
    : resultado;
}

export function obtenerLinea(id: number): Promise<Resultado<LineaDetalle>> {
  return solicitarConSesion({
    ruta: `/lineas/${id}`,
    esquema: esquemaLineaDetalle,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

export function registrarLineaEnBackend(
  datos: FormularioLinea,
): Promise<Resultado<{ id: number }>> {
  return solicitarConSesion({
    ruta: '/lineas',
    metodo: 'POST',
    cuerpo: datos,
    esquema: esquemaCreado,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

export function editarLineaEnBackend(
  id: number,
  datos: FormularioEdicionLinea,
): Promise<Resultado<undefined>> {
  return solicitarConSesion({
    ruta: `/lineas/${id}`,
    metodo: 'PATCH',
    cuerpo: datos,
    esquema: esquemaSinContenido,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

export function cambiarEstadoDeLineaEnBackend(
  id: number,
  datos: CambioDeEstado,
): Promise<Resultado<undefined>> {
  return solicitarConSesion({
    ruta: `/lineas/${id}/estado`,
    metodo: 'PUT',
    cuerpo: datos,
    esquema: esquemaSinContenido,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

export function definirRecorridoEnBackend(
  id: number,
  datos: FormularioRecorrido,
): Promise<Resultado<undefined>> {
  return solicitarConSesion({
    ruta: `/lineas/${id}/recorrido`,
    metodo: 'PUT',
    cuerpo: datos,
    esquema: esquemaSinContenido,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}
