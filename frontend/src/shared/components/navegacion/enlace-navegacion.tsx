'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactElement } from 'react';
import { Icono } from '@/shared/components/utilidades';
import { cn } from '@/shared/lib/cn';
import { estaActivo, type Destino } from './destinos';

type Forma = 'inferior' | 'lateral';

const FORMAS: Record<Forma, string> = {
  inferior: 'flex min-w-14 flex-col items-center gap-0.5 rounded-full px-3 py-1.5 text-eyebrow',
  lateral: 'flex h-control items-center gap-3 rounded-full px-4 text-label',
};

type Propiedades = Readonly<{ destino: Destino; forma: Forma; alNavegar?: () => void }>;

/** Destino de la navegación principal; el activo se realza como píldora oscura. */
export function EnlaceNavegacion({ destino, forma, alNavegar }: Propiedades): ReactElement {
  const activo = estaActivo(usePathname(), destino.href);
  const pendientes = destino.contador !== undefined && destino.contador > 0 ? destino.contador : 0;
  return (
    <Link
      href={destino.href}
      onClick={alNavegar}
      aria-current={activo ? 'page' : undefined}
      aria-label={
        pendientes > 0
          ? `${destino.etiqueta}, ${pendientes} ${pendientes === 1 ? 'pendiente' : 'pendientes'}`
          : undefined
      }
      className={cn(
        FORMAS[forma],
        'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none motion-safe:transition-colors',
        activo ? 'bg-night text-ink-inverse' : 'text-ink-muted hover:bg-canvas hover:text-ink',
      )}
    >
      <Icono
        nombre={destino.icono}
        tamano={forma === 'inferior' ? 24 : 20}
        className={activo ? 'text-accent' : undefined}
      />
      {destino.etiqueta}
      {pendientes > 0 ? (
        <span
          aria-hidden="true"
          className="rounded-full bg-danger px-2 text-eyebrow text-ink-inverse tabular-nums"
        >
          {pendientes}
        </span>
      ) : null}
    </Link>
  );
}
