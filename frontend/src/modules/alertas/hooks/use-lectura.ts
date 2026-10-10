import { useState, useTransition } from 'react';
import type { FormularioDeLectura } from '../schemas/lectura';
import type { EstadoDeLectura } from '../types/estado-de-lectura';

type Envio = Readonly<{
  pendiente: boolean;
  resultado: EstadoDeLectura | null;
  enviar: (datos: FormularioDeLectura) => void;
}>;

/** Llama a la acción de registro en una transición y guarda lo que responda. */
export function useLectura(
  accion: (datos: FormularioDeLectura) => Promise<EstadoDeLectura>,
): Envio {
  const [pendiente, iniciar] = useTransition();
  const [resultado, setResultado] = useState<EstadoDeLectura | null>(null);
  const enviar = (datos: FormularioDeLectura): void => {
    iniciar(async () => {
      setResultado(null);
      setResultado(await accion(datos));
    });
  };
  return { pendiente, resultado, enviar };
}
