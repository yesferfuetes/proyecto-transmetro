import 'server-only';
import type { Resultado } from '@/shared/lib/http/resultado';

/** Para las páginas: entrega los datos; cualquier error sube al `error.tsx` del segmento. */
export function exigirDatos<T>(resultado: Resultado<T>): T {
  if (resultado.ok) {
    return resultado.datos;
  }
  throw new Error(`No fue posible cargar las alertas: ${resultado.error.codigo}`);
}
