import 'server-only';
import { solicitarConSesion } from '@/shared/lib/http/cliente-backend';
import type { Resultado } from '@/shared/lib/http/resultado';
import { esquemaCreado, esquemaSinContenido } from '../schemas/comunes';
import {
  esquemaEstacionDetalle,
  esquemaOpcionesEstacion,
  esquemaPaginaEstaciones,
  type EstacionDetalle,
  type FiltrosEstaciones,
  type FormularioEdicionEstacion,
  type FormularioEstacion,
  type OpcionEstacion,
  type PaginaEstaciones,
} from '../schemas/estacion';
import { rutaConConsulta, TAMANO_DE_PAGINA, TIEMPO_DE_ESPERA_MS } from './parametros';

export function listarEstaciones(
  filtros: Partial<FiltrosEstaciones>,
): Promise<Resultado<PaginaEstaciones>> {
  return solicitarConSesion({
    ruta: rutaConConsulta('/estaciones', {
      municipalidadId: filtros.municipalidadId,
      lineaId: filtros.lineaId,
      tieneParqueo: filtros.tieneParqueo,
      busqueda: filtros.busqueda,
      pagina: filtros.pagina ?? 1,
      tamano: TAMANO_DE_PAGINA,
    }),
    esquema: esquemaPaginaEstaciones,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

export function obtenerEstacion(id: number): Promise<Resultado<EstacionDetalle>> {
  return solicitarConSesion({
    ruta: `/estaciones/${id}`,
    esquema: esquemaEstacionDetalle,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

/** Código y nombre de todas las estaciones, para el buscador del editor de recorrido. */
export function listarOpcionesDeEstacion(): Promise<Resultado<OpcionEstacion[]>> {
  return solicitarConSesion({
    ruta: '/estaciones/opciones',
    esquema: esquemaOpcionesEstacion,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

export function registrarEstacionEnBackend(
  datos: FormularioEstacion,
): Promise<Resultado<{ id: number }>> {
  return solicitarConSesion({
    ruta: '/estaciones',
    metodo: 'POST',
    cuerpo: datos,
    esquema: esquemaCreado,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

/** Sin coordenadas en el formulario, se envían las dos nulas para quitarlas. */
export function editarEstacionEnBackend(
  id: number,
  datos: FormularioEdicionEstacion,
): Promise<Resultado<undefined>> {
  return solicitarConSesion({
    ruta: `/estaciones/${id}`,
    metodo: 'PATCH',
    cuerpo: { ...datos, latitud: datos.latitud ?? null, longitud: datos.longitud ?? null },
    esquema: esquemaSinContenido,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}
