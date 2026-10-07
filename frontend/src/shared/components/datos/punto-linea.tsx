import type { ReactElement } from 'react';
import { cn } from '@/shared/lib/cn';
import type { CodigoLinea, Tono } from '@/shared/types/diseno';
import { estiloDeLinea } from './lineas';

type Propiedades = Readonly<{ codigo: CodigoLinea; nombre?: string; tono?: Tono }>;

/** Punto del color de la línea, siempre acompañado de su nombre en texto. */
export function PuntoLinea({ codigo, nombre, tono = 'claro' }: Propiedades): ReactElement {
  const estilo = estiloDeLinea(codigo, tono);
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className={cn('size-2.5 shrink-0 rounded-full', estilo.punto, estilo.contorno)}
      />
      <span>{nombre ?? estilo.nombre}</span>
    </span>
  );
}
