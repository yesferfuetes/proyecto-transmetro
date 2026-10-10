import 'server-only';
import { solicitarConSesion } from '@/shared/lib/http/cliente-backend';
import type { Resultado } from '@/shared/lib/http/resultado';
import { esquemaPaginaAlertas, type FiltrosAlertas, type PaginaAlertas } from '../schemas/alerta';
import { esquemaSinContenido } from '../schemas/comunes';
import { esquemaAlertaCreada, type FormularioDeLectura } from '../schemas/lectura';
import { rutaConConsulta, TIEMPO_DE_ESPERA_MS } from './parametros';

/** Filas por página del listado de alertas. */
export const TAMANO_DE_PAGINA = 25;

export function listarAlertas(filtros: FiltrosAlertas): Promise<Resultado<PaginaAlertas>> {
  return solicitarConSesion({
    ruta: rutaConConsulta('/alertas', {
      estado: filtros.estado,
      tipo: filtros.tipo,
      estacionId: filtros.estacion,
      lineaId: filtros.linea,
      pagina: filtros.pagina,
      tamano: TAMANO_DE_PAGINA,
    }),
    esquema: esquemaPaginaAlertas,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

type Lectura = FormularioDeLectura & Readonly<{ estacionId: number }>;

function registrar(
  ruta: string,
  lectura: Lectura,
): Promise<Resultado<{ alertaId: number | null }>> {
  return solicitarConSesion({
    ruta,
    metodo: 'POST',
    cuerpo: lectura,
    esquema: esquemaAlertaCreada,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

export function registrarDemandaEnBackend(
  lectura: Lectura,
): Promise<Resultado<{ alertaId: number | null }>> {
  return registrar('/alertas/demandas', lectura);
}

export function registrarOcupacionEnBackend(
  lectura: Lectura,
): Promise<Resultado<{ alertaId: number | null }>> {
  return registrar('/alertas/ocupaciones', lectura);
}

export function atenderEnBackend(id: number): Promise<Resultado<undefined>> {
  return solicitarConSesion({
    ruta: `/alertas/${id}/atencion`,
    metodo: 'PUT',
    esquema: esquemaSinContenido,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}
