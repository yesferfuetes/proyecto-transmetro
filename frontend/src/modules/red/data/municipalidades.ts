import 'server-only';
import { solicitarConSesion } from '@/shared/lib/http/cliente-backend';
import type { Resultado } from '@/shared/lib/http/resultado';
import { esquemaCreado, esquemaSinContenido } from '../schemas/comunes';
import {
  esquemaMunicipalidad,
  esquemaPaginaMunicipalidades,
  type FormularioMunicipalidad,
  type Municipalidad,
  type MunicipalidadListado,
  type PaginaMunicipalidades,
} from '../schemas/municipalidad';
import {
  rutaConConsulta,
  TAMANO_DE_PAGINA,
  TAMANO_MAXIMO,
  TIEMPO_DE_ESPERA_MS,
} from './parametros';

export function listarMunicipalidades(
  pagina: number,
  tamano: number = TAMANO_DE_PAGINA,
): Promise<Resultado<PaginaMunicipalidades>> {
  return solicitarConSesion({
    ruta: rutaConConsulta('/municipalidades', { pagina, tamano }),
    esquema: esquemaPaginaMunicipalidades,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

/** Todas las municipalidades, recorriendo las páginas; para los selectores y filtros. */
export async function listarTodasLasMunicipalidades(): Promise<Resultado<MunicipalidadListado[]>> {
  const todas: MunicipalidadListado[] = [];
  for (let pagina = 1; ; pagina += 1) {
    const resultado = await listarMunicipalidades(pagina, TAMANO_MAXIMO);
    if (!resultado.ok) {
      return resultado;
    }
    todas.push(...resultado.datos.elementos);
    const sinMas = resultado.datos.elementos.length === 0 || todas.length >= resultado.datos.total;
    if (sinMas) {
      return { ok: true, datos: todas };
    }
  }
}

export function obtenerMunicipalidad(id: number): Promise<Resultado<Municipalidad>> {
  return solicitarConSesion({
    ruta: `/municipalidades/${id}`,
    esquema: esquemaMunicipalidad,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

export function registrarMunicipalidadEnBackend(
  datos: FormularioMunicipalidad,
): Promise<Resultado<{ id: number }>> {
  return solicitarConSesion({
    ruta: '/municipalidades',
    metodo: 'POST',
    cuerpo: datos,
    esquema: esquemaCreado,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

export function editarMunicipalidadEnBackend(
  id: number,
  datos: FormularioMunicipalidad,
): Promise<Resultado<undefined>> {
  return solicitarConSesion({
    ruta: `/municipalidades/${id}`,
    metodo: 'PATCH',
    cuerpo: datos,
    esquema: esquemaSinContenido,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}
