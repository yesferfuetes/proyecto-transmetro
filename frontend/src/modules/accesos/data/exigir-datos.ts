import 'server-only';
import { notFound } from 'next/navigation';
import type { Resultado } from '@/shared/lib/http/resultado';

const NO_EXISTE = new Set([
  'ACCESO_NO_EXISTE',
  'GUARDIA_NO_EXISTE',
  'ESTACION_NO_EXISTE',
  'LINEA_NO_EXISTE',
]);

/**
 * Para las páginas: entrega los datos, lleva a "no encontrado" si el backend dice que no existe y
 * cualquier otro error sube al `error.tsx` del segmento.
 */
export function exigirDatos<T>(resultado: Resultado<T>): T {
  if (resultado.ok) {
    return resultado.datos;
  }
  if (NO_EXISTE.has(resultado.error.codigo)) {
    notFound();
  }
  throw new Error(`No fue posible cargar los accesos: ${resultado.error.codigo}`);
}
