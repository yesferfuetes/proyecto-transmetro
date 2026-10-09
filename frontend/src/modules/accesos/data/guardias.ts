import 'server-only';
import { solicitarConSesion } from '@/shared/lib/http/cliente-backend';
import type { Resultado } from '@/shared/lib/http/resultado';
import { esquemaCreado, esquemaSinContenido } from '../schemas/comunes';
import {
  esquemaGuardiaDetalle,
  esquemaOpcionesDeGuardia,
  esquemaPaginaGuardias,
  type FiltrosGuardias,
  type FormularioGuardia,
  type GuardiaDetalle,
  type OpcionDeGuardia,
  type PaginaGuardias,
} from '../schemas/guardia';
import { rutaConConsulta, TAMANO_DE_PAGINA, TIEMPO_DE_ESPERA_MS } from './parametros';

export function listarGuardias(
  filtros: Partial<FiltrosGuardias>,
): Promise<Resultado<PaginaGuardias>> {
  return solicitarConSesion({
    ruta: rutaConConsulta('/guardias', {
      busqueda: filtros.busqueda,
      pagina: filtros.pagina ?? 1,
      tamano: TAMANO_DE_PAGINA,
    }),
    esquema: esquemaPaginaGuardias,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

export function obtenerGuardia(id: number): Promise<Resultado<GuardiaDetalle>> {
  return solicitarConSesion({
    ruta: `/guardias/${id}`,
    esquema: esquemaGuardiaDetalle,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

/** Nombre y DPI de todos los guardias, para elegir uno al asignar. */
export function listarOpcionesDeGuardia(): Promise<Resultado<OpcionDeGuardia[]>> {
  return solicitarConSesion({
    ruta: '/guardias/opciones',
    esquema: esquemaOpcionesDeGuardia,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

export function registrarGuardiaEnBackend(
  datos: FormularioGuardia,
): Promise<Resultado<{ id: number }>> {
  return solicitarConSesion({
    ruta: '/guardias',
    metodo: 'POST',
    cuerpo: datos,
    esquema: esquemaCreado,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

/** Sin teléfono en el formulario, se envía nulo para quitarlo. */
export function editarGuardiaEnBackend(
  id: number,
  datos: FormularioGuardia,
): Promise<Resultado<undefined>> {
  return solicitarConSesion({
    ruta: `/guardias/${id}`,
    metodo: 'PATCH',
    cuerpo: { ...datos, telefono: datos.telefono ?? null },
    esquema: esquemaSinContenido,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}
