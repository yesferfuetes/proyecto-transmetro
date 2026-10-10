import 'server-only';
import { solicitarConSesion } from '@/shared/lib/http/cliente-backend';
import type { Resultado } from '@/shared/lib/http/resultado';
import { esquemaHuella, type Huella } from '../schemas/alerta';
import { TIEMPO_DE_ESPERA_MS } from './parametros';

/** Pendientes, atendidas y última alerta del alcance de la sesión; barata para consultar seguido. */
export function leerHuella(): Promise<Resultado<Huella>> {
  return solicitarConSesion({
    ruta: '/alertas/huella',
    esquema: esquemaHuella,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

/** Alertas pendientes para el contador de la navegación; `undefined` si no se pudo leer. */
export async function leerPendientesDeAlertas(): Promise<number | undefined> {
  const resultado = await leerHuella();
  return resultado.ok ? resultado.datos.pendientes : undefined;
}
