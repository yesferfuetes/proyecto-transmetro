import type { ErrorDeCampo } from '@/shared/components/formulario';
import type { ErrorDeBackend } from '@/shared/lib/http/resultado';
import type { EstadoDeEnvio } from '../hooks/use-envio';

export function errorDelEnvio(estado: EstadoDeEnvio): ErrorDeBackend | null {
  return estado.resultado && !estado.resultado.ok ? estado.resultado.error : null;
}

export function envioExitoso(estado: EstadoDeEnvio): boolean {
  return estado.resultado?.ok === true;
}

/** Enlaces del resumen a cada campo que el servidor marcó como inválido. */
export function erroresDeCampo(error: ErrorDeBackend, prefijo: string): ErrorDeCampo[] {
  return error.detalles.map((detalle) => ({
    campoId: `${prefijo}-${detalle.campo}`,
    mensaje: detalle.mensajes.join(' '),
  }));
}

/** Mensaje del servidor para un campo, si lo marcó. */
export function mensajeDelServidor(estado: EstadoDeEnvio, campo: string): string | undefined {
  return errorDelEnvio(estado)
    ?.detalles.find((detalle) => detalle.campo === campo)
    ?.mensajes.join(' ');
}
