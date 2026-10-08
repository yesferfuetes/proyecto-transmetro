import 'server-only';
import { redirect } from 'next/navigation';
import type { Resultado } from '@/shared/lib/http/resultado';

/**
 * Para las páginas: entrega los datos o resuelve el fallo. Sin sesión vigente lleva a iniciarla;
 * sin permiso, a acceso denegado; cualquier otro error sube al `error.tsx` del segmento.
 */
export function exigirDatos<T>(resultado: Resultado<T>): T {
  if (resultado.ok) {
    return resultado.datos;
  }
  const { codigo } = resultado.error;
  if (codigo === 'SESION_EXPIRADA' || codigo === 'NO_AUTENTICADO') {
    redirect('/login?motivo=expirada');
  }
  if (codigo === 'ACCESO_DENEGADO') {
    redirect('/acceso-denegado');
  }
  throw new Error(`No fue posible cargar los datos: ${codigo}`);
}
