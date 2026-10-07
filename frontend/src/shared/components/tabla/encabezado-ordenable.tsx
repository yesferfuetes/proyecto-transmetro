import Link from 'next/link';
import type { ReactElement, ReactNode } from 'react';
import { Icono } from '@/shared/components/utilidades';

export type Orden = 'asc' | 'desc' | null;

type Propiedades = Readonly<{ etiqueta: ReactNode; href: string; orden: Orden }>;

const ICONO = { asc: 'flecha-arriba', desc: 'flecha-abajo' } as const;

/** Enlace del encabezado de columna que cambia el orden por parámetros de búsqueda. */
export function EncabezadoOrdenable({ etiqueta, href, orden }: Propiedades): ReactElement {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 rounded-sm hover:text-ink focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
    >
      {etiqueta}
      <Icono nombre={orden ? ICONO[orden] : 'ordenar'} tamano={16} />
    </Link>
  );
}

export const ARIA_SORT = { asc: 'ascending', desc: 'descending' } as const;
