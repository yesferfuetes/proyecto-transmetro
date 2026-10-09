import 'server-only';
import { solicitarConSesion } from '@/shared/lib/http/cliente-backend';
import type { Resultado } from '@/shared/lib/http/resultado';
import { esquemaPaginaDeLineas, type OpcionDeLinea } from '../schemas/linea';
import { rutaConConsulta, TAMANO_MAXIMO, TIEMPO_DE_ESPERA_MS } from './parametros';

/** Líneas de la red, solo para identificarlas en el filtro y enlazar a sus accesos. */
export async function listarOpcionesDeLinea(): Promise<Resultado<OpcionDeLinea[]>> {
  const resultado = await solicitarConSesion({
    ruta: rutaConConsulta('/lineas', { pagina: 1, tamano: TAMANO_MAXIMO }),
    esquema: esquemaPaginaDeLineas,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
  return resultado.ok ? { ok: true, datos: resultado.datos.elementos } : resultado;
}
