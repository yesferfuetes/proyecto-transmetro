import 'server-only';
import { solicitarConSesion } from '@/shared/lib/http/cliente-backend';
import type { Resultado } from '@/shared/lib/http/resultado';
import {
  esquemaAccesoDetalle,
  esquemaAccesosDeLinea,
  esquemaOpcionesDeEstacion,
  esquemaPaginaAccesos,
  type AccesoDetalle,
  type AccesosDeLinea,
  type FiltrosAccesos,
  type FormularioAcceso,
  type FormularioAsignacion,
  type FormularioEdicionAcceso,
  type PaginaAccesos,
  type ReferenciaDeEstacion,
} from '../schemas/acceso';
import { esquemaCreado, esquemaSinContenido } from '../schemas/comunes';
import { rutaConConsulta, TAMANO_DE_PAGINA, TIEMPO_DE_ESPERA_MS } from './parametros';

export function listarAccesos(filtros: Partial<FiltrosAccesos>): Promise<Resultado<PaginaAccesos>> {
  return solicitarConSesion({
    ruta: rutaConConsulta('/accesos', {
      lineaId: filtros.lineaId,
      estacionId: filtros.estacionId,
      busqueda: filtros.busqueda,
      pagina: filtros.pagina ?? 1,
      tamano: TAMANO_DE_PAGINA,
    }),
    esquema: esquemaPaginaAccesos,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

export function obtenerAcceso(id: number): Promise<Resultado<AccesoDetalle>> {
  return solicitarConSesion({
    ruta: `/accesos/${id}`,
    esquema: esquemaAccesoDetalle,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

export function listarAccesosDeLinea(lineaId: number): Promise<Resultado<AccesosDeLinea>> {
  return solicitarConSesion({
    ruta: `/accesos/lineas/${lineaId}`,
    esquema: esquemaAccesosDeLinea,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

/** Código y nombre de todas las estaciones, para el filtro y el formulario de acceso. */
export function listarOpcionesDeEstacion(): Promise<Resultado<ReferenciaDeEstacion[]>> {
  return solicitarConSesion({
    ruta: '/accesos/opciones/estaciones',
    esquema: esquemaOpcionesDeEstacion,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

export function registrarAccesoEnBackend(
  datos: FormularioAcceso,
): Promise<Resultado<{ id: number }>> {
  return solicitarConSesion({
    ruta: '/accesos',
    metodo: 'POST',
    cuerpo: datos,
    esquema: esquemaCreado,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

export function editarAccesoEnBackend(
  id: number,
  datos: FormularioEdicionAcceso,
): Promise<Resultado<undefined>> {
  return solicitarConSesion({
    ruta: `/accesos/${id}`,
    metodo: 'PATCH',
    cuerpo: datos,
    esquema: esquemaSinContenido,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

export function asignarGuardiaEnBackend(
  accesoId: number,
  datos: FormularioAsignacion,
): Promise<Resultado<undefined>> {
  return solicitarConSesion({
    ruta: `/accesos/${accesoId}/asignaciones`,
    metodo: 'POST',
    cuerpo: datos,
    esquema: esquemaSinContenido,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

export function quitarAsignacionEnBackend(
  accesoId: number,
  datos: FormularioAsignacion,
): Promise<Resultado<undefined>> {
  return solicitarConSesion({
    ruta: rutaConConsulta(`/accesos/${accesoId}/asignaciones`, {
      guardiaId: datos.guardiaId,
      turno: datos.turno,
    }),
    metodo: 'DELETE',
    esquema: esquemaSinContenido,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}
