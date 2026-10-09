import 'server-only';
import { solicitarConSesion } from '@/shared/lib/http/cliente-backend';
import type { Resultado } from '@/shared/lib/http/resultado';
import {
  esquemaOpcionesDeEstacion,
  esquemaOpcionesDeLinea,
  esquemaOpcionesDeParqueo,
  type OpcionDeEstacion,
  type OpcionDeLinea,
} from '../schemas/opciones';
import type { Parqueo } from '../schemas/parqueo';
import { TIEMPO_DE_ESPERA_MS } from './parametros';

/** Líneas que pueden recibir buses (no inactivas), con su conteo y su máximo. */
export function listarOpcionesDeLinea(): Promise<Resultado<OpcionDeLinea[]>> {
  return solicitarConSesion({
    ruta: '/flota/opciones/lineas',
    esquema: esquemaOpcionesDeLinea,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

/** Parqueos con cupo para recibir un bus. */
export function listarOpcionesDeParqueo(): Promise<Resultado<Parqueo[]>> {
  return solicitarConSesion({
    ruta: '/flota/opciones/parqueos',
    esquema: esquemaOpcionesDeParqueo,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

/** Estaciones que pueden recibir un parqueo. */
export async function listarOpcionesDeEstacion(): Promise<Resultado<OpcionDeEstacion[]>> {
  const resultado = await solicitarConSesion({
    ruta: '/flota/opciones/estaciones',
    esquema: esquemaOpcionesDeEstacion,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
  return resultado.ok
    ? { ok: true, datos: resultado.datos.filter((estacion) => estacion.tieneParqueo) }
    : resultado;
}
