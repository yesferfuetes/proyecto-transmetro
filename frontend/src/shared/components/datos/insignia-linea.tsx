import type { ReactElement } from 'react';
import { TextoOculto } from '@/shared/components/utilidades';
import { cn } from '@/shared/lib/cn';
import type { CodigoLinea, Tono } from '@/shared/types/diseno';
import { estiloDeLinea } from './lineas';

type Tamano = 'chico' | 'mediano' | 'grande';

const TAMANOS: Record<Tamano, string> = {
  chico: 'h-8 min-w-8 rounded-sm px-1 text-line-number',
  mediano: 'h-10 min-w-10 rounded-md px-1.5 text-line-number',
  grande: 'h-14 min-w-14 rounded-md px-2 text-line-number-lg',
};

type Propiedades = Readonly<{ codigo: CodigoLinea; tamano?: Tamano; tono?: Tono }>;

/** Cuadrado sólido con el número de la línea en su color oficial. */
export function InsigniaLinea({
  codigo,
  tamano = 'chico',
  tono = 'claro',
}: Propiedades): ReactElement {
  const estilo = estiloDeLinea(codigo, tono);
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center tabular-nums',
        TAMANOS[tamano],
        estilo.insignia,
        estilo.contorno,
      )}
    >
      <span aria-hidden="true">{estilo.rotulo}</span>
      <TextoOculto>{estilo.nombre}</TextoOculto>
    </span>
  );
}
