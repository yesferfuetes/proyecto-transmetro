'use client';

import { useEffect, useRef, type ReactElement } from 'react';
import { Icono } from '@/shared/components/utilidades';

export type ErrorDeCampo = Readonly<{ campoId: string; mensaje: string }>;

type Propiedades = Readonly<{
  /** Mensaje del backend tal como llega. */
  mensaje: string;
  errores?: readonly ErrorDeCampo[];
}>;

/** Resumen que recibe el foco al fallar un envío y enlaza a cada campo inválido. */
export function ResumenErrores({ mensaje, errores = [] }: Propiedades): ReactElement {
  const referencia = useRef<HTMLDivElement>(null);

  useEffect(() => {
    referencia.current?.focus();
  }, []);

  return (
    <div
      ref={referencia}
      role="alert"
      tabIndex={-1}
      className="flex gap-3 rounded-lg border-l-4 border-l-danger bg-danger-soft p-4 text-danger-strong focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
    >
      <Icono nombre="error" className="mt-0.5" />
      <div className="flex flex-col gap-2">
        <p className="text-label">{mensaje}</p>
        {errores.length > 0 ? (
          <ul className="flex list-disc flex-col gap-1 ps-5 text-dense">
            {errores.map((error) => (
              <li key={error.campoId}>
                <a href={`#${error.campoId}`} className="underline hover:no-underline">
                  {error.mensaje}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
