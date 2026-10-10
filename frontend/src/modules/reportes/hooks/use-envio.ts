import { useState, useTransition } from 'react';
import type { FieldErrors, FieldValues } from 'react-hook-form';
import type { ErrorDeCampo } from '@/shared/components/formulario';
import type { EstadoDeAccion } from '@/shared/lib/acciones';
import type { ErrorDeBackend } from '@/shared/lib/http/resultado';

type Envio<T> = Readonly<{
  pendiente: boolean;
  error: ErrorDeBackend | null;
  enviar: (datos: T) => void;
}>;

/** Llama a una acción de servidor en una transición y guarda el error que devuelva. */
export function useEnvio<T>(accion: (datos: T) => Promise<EstadoDeAccion>): Envio<T> {
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<ErrorDeBackend | null>(null);
  const enviar = (datos: T): void => {
    iniciar(async () => {
      const resultado = await accion(datos);
      setError(resultado.ok ? null : resultado.error);
    });
  };
  return { pendiente, error, enviar };
}

/** Errores por campo del backend, enlazados al campo del formulario con el mismo nombre. */
export function erroresDeCampo(error: ErrorDeBackend): ErrorDeCampo[] {
  return error.detalles.map((detalle) => ({
    campoId: detalle.campo,
    mensaje: detalle.mensajes.join(' '),
  }));
}

/** Mensaje de error de un campo del formulario, si lo tiene. */
export function mensajeDe<T extends FieldValues>(
  errores: FieldErrors<T>,
  campo: keyof T & string,
): string | undefined {
  const mensaje = errores[campo]?.message;
  return typeof mensaje === 'string' ? mensaje : undefined;
}
