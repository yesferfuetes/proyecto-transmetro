import type { ReactElement, ReactNode } from 'react';
import { estiloDeLinea } from '@/shared/components/datos/lineas';
import { cn } from '@/shared/lib/cn';
import type { CodigoLinea } from '@/shared/types/diseno';

type Variante = 'clara' | 'densa' | 'oscura' | 'acento';

const VARIANTES: Record<Variante, string> = {
  clara: 'rounded-xl border border-border bg-surface p-6',
  densa: 'rounded-lg border border-border bg-surface p-4',
  oscura: 'rounded-xl border border-night-mid bg-night-raised p-6 text-ink-inverse',
  acento: 'rounded-xl bg-accent p-6 text-ink',
};

type Propiedades = Readonly<{
  variante?: Variante;
  /** Identifica la tarjeta con el color de una línea mediante un borde izquierdo. */
  linea?: CodigoLinea;
  como?: 'section' | 'article' | 'div';
  className?: string;
  children: ReactNode;
}>;

/** Superficie con esquinas muy redondeadas y borde sutil, sin sombra en reposo. */
export function Tarjeta({
  variante = 'clara',
  linea,
  como: Elemento = 'div',
  className,
  children,
}: Propiedades): ReactElement {
  return (
    <Elemento
      className={cn(
        VARIANTES[variante],
        linea ? cn('border-l-4', estiloDeLinea(linea).borde) : null,
        className,
      )}
    >
      {children}
    </Elemento>
  );
}
