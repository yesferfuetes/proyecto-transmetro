import 'server-only';
import type { Resultado } from '@/shared/lib/http/resultado';

/** La constancia no existe, es de otra persona o es de otro tipo de reporte. */
const CONSULTA_NO_DISPONIBLE = new Set(['CONSULTA_NO_EXISTE', 'TIPO_DE_REPORTE_INVALIDO']);

export function consultaNoDisponible(resultado: Resultado<unknown>): boolean {
  return !resultado.ok && CONSULTA_NO_DISPONIBLE.has(resultado.error.codigo);
}

/** Para las páginas: entrega los datos; cualquier error sube al `error.tsx` del segmento. */
export function exigirDatos<T>(resultado: Resultado<T>): T {
  if (resultado.ok) {
    return resultado.datos;
  }
  throw new Error(`No fue posible cargar los reportes: ${resultado.error.codigo}`);
}
