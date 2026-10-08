import { startTransition, useActionState } from 'react';
import type { EstadoDeAccion } from '@/shared/lib/acciones';

export type EstadoDeEnvio = Readonly<{
  resultado: EstadoDeAccion | null;
  /** Cuenta los envíos para volver a anunciar un error aunque se repita. */
  intento: number;
}>;

type Envio<E> = Readonly<{
  estado: EstadoDeEnvio;
  enviar: (entrada: E) => void;
  pendiente: boolean;
}>;

const INICIAL: EstadoDeEnvio = { resultado: null, intento: 0 };

/**
 * Ejecuta una acción de servidor en una transición y conserva su último resultado. `alExito`
 * corre en cuanto la acción confirma, por ejemplo para vaciar el formulario.
 */
export function useEnvio<E>(
  accion: (entrada: E) => Promise<EstadoDeAccion>,
  alExito?: () => void,
): Envio<E> {
  const [estado, despachar, pendiente] = useActionState(
    async (previo: EstadoDeEnvio, entrada: E): Promise<EstadoDeEnvio> => {
      const resultado = await accion(entrada);
      if (resultado.ok) {
        alExito?.();
      }
      return { resultado, intento: previo.intento + 1 };
    },
    INICIAL,
  );
  const enviar = (entrada: E): void => {
    startTransition(() => {
      despachar(entrada);
    });
  };
  return { estado, enviar, pendiente };
}
