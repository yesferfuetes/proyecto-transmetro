import 'server-only';
import { solicitarConSesion } from '@/shared/lib/http/cliente-backend';
import type { Resultado } from '@/shared/lib/http/resultado';
import { esquemaCreado, esquemaSinContenido } from '../schemas/comunes';
import {
  esquemaParqueo,
  esquemaParqueos,
  type EdicionDeParqueo,
  type FormularioParqueo,
  type Parqueo,
} from '../schemas/parqueo';
import { TIEMPO_DE_ESPERA_MS } from './parametros';

export function listarParqueos(): Promise<Resultado<Parqueo[]>> {
  return solicitarConSesion({
    ruta: '/flota/parqueos',
    esquema: esquemaParqueos,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

export function obtenerParqueo(id: number): Promise<Resultado<Parqueo>> {
  return solicitarConSesion({
    ruta: `/flota/parqueos/${id}`,
    esquema: esquemaParqueo,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

export function registrarParqueoEnBackend(
  datos: FormularioParqueo,
): Promise<Resultado<{ id: number }>> {
  return solicitarConSesion({
    ruta: '/flota/parqueos',
    metodo: 'POST',
    cuerpo: datos,
    esquema: esquemaCreado,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

export function editarParqueoEnBackend(
  id: number,
  datos: EdicionDeParqueo,
): Promise<Resultado<undefined>> {
  return solicitarConSesion({
    ruta: `/flota/parqueos/${id}`,
    metodo: 'PATCH',
    cuerpo: datos,
    esquema: esquemaSinContenido,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

export function eliminarParqueoEnBackend(id: number): Promise<Resultado<undefined>> {
  return solicitarConSesion({
    ruta: `/flota/parqueos/${id}`,
    metodo: 'DELETE',
    esquema: esquemaSinContenido,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}
