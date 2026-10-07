import Link from 'next/link';
import type { ReactElement } from 'react';
import { Icono, type NombreIcono } from '@/shared/components/utilidades';

type Propiedades = Readonly<{ href: string; etiqueta: string; icono: NombreIcono }>;

/** Acceso rápido: cuadrado con el degradado del acento, ícono centrado y etiqueta debajo. */
export function Mosaico({ href, etiqueta, icono }: Propiedades): ReactElement {
  return (
    <Link
      href={href}
      className="group flex w-tile flex-col items-center gap-2 focus-visible:outline-none xl:w-tile-lg"
    >
      <span className="flex size-tile items-center justify-center rounded-lg border border-accent-500 bg-linear-to-br from-accent to-accent-light text-ink shadow-sm group-hover:from-accent-500 group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2 motion-safe:transition-colors xl:size-tile-lg">
        <Icono nombre={icono} tamano={28} />
      </span>
      <span className="text-center text-label text-ink">{etiqueta}</span>
    </Link>
  );
}
