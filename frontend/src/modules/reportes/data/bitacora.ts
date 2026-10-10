import 'server-only';
import { solicitarConSesion } from '@/shared/lib/http/cliente-backend';
import type { Resultado } from '@/shared/lib/http/resultado';
import {
  esquemaPaginaDeBitacora,
  type FiltrosDeBitacora,
  type PaginaDeBitacora,
} from '../schemas/bitacora';
import { rutaConConsulta, TAMANO_DE_PAGINA, TIEMPO_DE_ESPERA_MS } from './parametros';

/** Consultas de todos los usuarios, de la más reciente a la más antigua. */
export function listarBitacora(filtros: FiltrosDeBitacora): Promise<Resultado<PaginaDeBitacora>> {
  return solicitarConSesion({
    ruta: rutaConConsulta('/reportes/bitacora', {
      usuarioId: filtros.usuarioId,
      tipo: filtros.tipo,
      desde: filtros.desde,
      hasta: filtros.hasta,
      pagina: filtros.pagina,
      tamano: TAMANO_DE_PAGINA,
    }),
    esquema: esquemaPaginaDeBitacora,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}
