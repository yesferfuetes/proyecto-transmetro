import 'server-only';
import { solicitarConSesion } from '@/shared/lib/http/cliente-backend';
import type { Resultado } from '@/shared/lib/http/resultado';
import { esquemaFlotaPorLinea, type FlotaDeLinea } from '../schemas/flota-por-linea';
import { TIEMPO_DE_ESPERA_MS } from './parametros';

export function listarFlotaPorLinea(): Promise<Resultado<FlotaDeLinea[]>> {
  return solicitarConSesion({
    ruta: '/flota/lineas',
    esquema: esquemaFlotaPorLinea,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}
