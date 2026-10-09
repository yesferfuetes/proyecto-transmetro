import { useState, useTransition } from 'react';
import type { FieldErrors, FieldValues } from 'react-hook-form';
import type { ErrorDeCampo } from '@/shared/components/formulario';
import type { EstadoDeAccion } from '@/shared/lib/acciones';
import type { ErrorDeBackend } from '@/shared/lib/http/resultado';

type Envio<T> = Readonly<{
  pendiente: boolean;
  error: ErrorDeBackend | null;
  /** Verdadero tras un envío aceptado que no redirige; el siguiente envío lo apaga. */
  guardado: boolean;
  enviar: (datos: T) => void;
  /** Olvida el error y el aviso del envío anterior. */
  reiniciar: () => void;
}>;

/**
 * Llama a una acción de servidor en una transición y guarda el error que devuelva. `alGuardar`
 * corre solo si el backend aceptó la acción y esta no redirigió.
 */
export function useEnvio<T>(
  accion: (datos: T) => Promise<EstadoDeAccion>,
  alGuardar?: () => void,
): Envio<T> {
  const [pendiente, iniciar] = useTransition();
  const [resultado, setResultado] = useState<EstadoDeAccion | null>(null);
  const enviar = (datos: T): void => {
    iniciar(async () => {
      const respuesta = await accion(datos);
      setResultado(respuesta);
      if (respuesta.ok) {
        alGuardar?.();
      }
    });
  };
  return {
    pendiente,
    error: resultado && !resultado.ok ? resultado.error : null,
    guardado: resultado?.ok === true,
    enviar,
    reiniciar: () => setResultado(null),
  };
}

/** Errores por campo del backend, enlazados al campo del formulario con el mismo nombre. */
export function erroresDeCampo(error: ErrorDeBackend): ErrorDeCampo[] {
  return error.detalles.map((detalle) => ({
    campoId: detalle.campo.replace(/^datos\./, ''),
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
