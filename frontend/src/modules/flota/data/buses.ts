import 'server-only';
import { solicitarConSesion } from '@/shared/lib/http/cliente-backend';
import type { Resultado } from '@/shared/lib/http/resultado';
import {
  esquemaBus,
  esquemaPaginaBuses,
  type Bus,
  type CambioDeEstado,
  type CambioDeLinea,
  type CambioDeParqueo,
  type EdicionDeBus,
  type FiltrosBuses,
  type FormularioBus,
  type PaginaBuses,
} from '../schemas/bus';
import { esquemaCreado, esquemaSinContenido } from '../schemas/comunes';
import { rutaConConsulta, TIEMPO_DE_ESPERA_MS } from './parametros';

/** Filas por página del listado de buses. */
export const TAMANO_DE_PAGINA = 25;

export function listarBuses(filtros: FiltrosBuses): Promise<Resultado<PaginaBuses>> {
  return solicitarConSesion({
    ruta: rutaConConsulta('/flota/buses', {
      lineaId: filtros.lineaId,
      sinLinea: filtros.sinLinea === '1' ? true : undefined,
      estado: filtros.estado,
      parqueoId: filtros.parqueoId,
      busqueda: filtros.busqueda,
      pagina: filtros.pagina,
      tamano: TAMANO_DE_PAGINA,
    }),
    esquema: esquemaPaginaBuses,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

export function obtenerBus(id: number): Promise<Resultado<Bus>> {
  return solicitarConSesion({
    ruta: `/flota/buses/${id}`,
    esquema: esquemaBus,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

export function registrarBusEnBackend(datos: FormularioBus): Promise<Resultado<{ id: number }>> {
  return solicitarConSesion({
    ruta: '/flota/buses',
    metodo: 'POST',
    cuerpo: datos,
    esquema: esquemaCreado,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

function escribirEnBus(
  id: number,
  sufijo: string,
  metodo: 'PATCH' | 'PUT',
  cuerpo: unknown,
): Promise<Resultado<undefined>> {
  return solicitarConSesion({
    ruta: `/flota/buses/${id}${sufijo}`,
    metodo,
    cuerpo,
    esquema: esquemaSinContenido,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

export function editarBusEnBackend(id: number, datos: EdicionDeBus): Promise<Resultado<undefined>> {
  return escribirEnBus(id, '', 'PATCH', datos);
}

export function asignarLineaEnBackend(
  id: number,
  datos: CambioDeLinea,
): Promise<Resultado<undefined>> {
  return escribirEnBus(id, '/linea', 'PUT', datos);
}

export function cambiarParqueoEnBackend(
  id: number,
  datos: CambioDeParqueo,
): Promise<Resultado<undefined>> {
  return escribirEnBus(id, '/parqueo', 'PUT', datos);
}

export function cambiarEstadoEnBackend(
  id: number,
  datos: CambioDeEstado,
): Promise<Resultado<undefined>> {
  return escribirEnBus(id, '/estado', 'PUT', datos);
}
