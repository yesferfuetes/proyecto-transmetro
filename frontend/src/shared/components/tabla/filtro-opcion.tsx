import Link from 'next/link';
import type { ReactElement, ReactNode } from 'react';
import { Icono } from '@/shared/components/utilidades';
import { cn } from '@/shared/lib/cn';
import { FILTRO_ACTIVO, FILTRO_INACTIVO, PILDORA_FILTRO } from './estilos-filtro';

type Propiedades = Readonly<{ href: string; activo: boolean; children: ReactNode }>;

/** Píldora que activa o quita un valor de filtro. */
export function FiltroOpcion({ href, activo, children }: Propiedades): ReactElement {
  return (
    <Link
      href={href}
      aria-current={activo ? 'true' : undefined}
      className={cn(PILDORA_FILTRO, activo ? FILTRO_ACTIVO : FILTRO_INACTIVO)}
    >
      {activo ? <Icono nombre="marca" tamano={16} /> : null}
      {children}
    </Link>
  );
}
