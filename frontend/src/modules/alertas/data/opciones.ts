import 'server-only';
import { solicitarConSesion } from '@/shared/lib/http/cliente-backend';
import type { Resultado } from '@/shared/lib/http/resultado';
import { esquemaOpcionesDeAlertas, type OpcionesDeAlertas } from '../schemas/alerta';
import { esquemaBusesParaLectura, type BusParaLectura } from '../schemas/lectura';
import { TIEMPO_DE_ESPERA_MS } from './parametros';

/** Buses activos de las líneas que pasan por la estación del operador. */
export function listarBusesParaLectura(): Promise<Resultado<BusParaLectura[]>> {
  return solicitarConSesion({
    ruta: '/alertas/opciones/buses',
    esquema: esquemaBusesParaLectura,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

/** Estaciones y líneas para los filtros del supervisor y el administrador. */
export function listarOpciones(): Promise<Resultado<OpcionesDeAlertas>> {
  return solicitarConSesion({
    ruta: '/alertas/opciones',
    esquema: esquemaOpcionesDeAlertas,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}
