import type { ReactElement, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import type { Tono } from '@/shared/types/diseno';

const FORMATO = new Intl.NumberFormat('es-GT');

type Propiedades = Readonly<{
  etiqueta: string;
  valor: number;
  unidad?: string;
  tono?: Tono;
  tamano?: 'protagonista' | 'tarjeta';
  /** Estado que acompaña la cifra; el número nunca cambia de color. */
  estado?: ReactNode;
}>;

/** Número clave en tamaño grande con su etiqueta pequeña encima. */
export function Cifra({
  etiqueta,
  valor,
  unidad,
  tono = 'claro',
  tamano = 'protagonista',
  estado,
}: Propiedades): ReactElement {
  const oscuro = tono === 'oscuro';
  return (
    <dl className="flex flex-col gap-2">
      <dt
        className={cn(
          'text-eyebrow uppercase',
          oscuro ? 'text-ink-inverse-muted' : 'text-ink-muted',
        )}
      >
        {etiqueta}
      </dt>
      <dd
        className={cn(
          'flex items-baseline gap-2 tabular-nums',
          oscuro ? 'text-ink-inverse' : 'text-ink',
        )}
      >
        <span
          className={tamano === 'protagonista' ? 'text-figure lg:text-figure-lg' : 'text-figure-sm'}
        >
          {FORMATO.format(valor)}
        </span>
        {unidad ? <span className="text-heading">{unidad}</span> : null}
      </dd>
      {estado ? <dd className="flex flex-wrap gap-2">{estado}</dd> : null}
    </dl>
  );
}
