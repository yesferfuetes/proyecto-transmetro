import Link from 'next/link';
import type { ReactElement } from 'react';
import { Icono } from '@/shared/components/utilidades';

type Propiedades = Readonly<{
  pagina: number;
  totalPaginas: number;
  hrefDePagina: (pagina: number) => string;
}>;

const ENLACE =
  'inline-flex h-control items-center gap-1 rounded-full px-4 text-label text-primary hover:bg-primary-soft focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none';
const INACTIVO = 'inline-flex h-control items-center gap-1 px-4 text-label text-ink-muted';

/** Anterior, página actual y siguiente, con enlaces que cambian el parámetro de página. */
export function Paginacion({ pagina, totalPaginas, hrefDePagina }: Propiedades): ReactElement {
  const hayAnterior = pagina > 1;
  const haySiguiente = pagina < totalPaginas;
  return (
    <nav aria-label="Paginación" className="flex items-center justify-between gap-4">
      {hayAnterior ? (
        <Link href={hrefDePagina(pagina - 1)} className={ENLACE}>
          <Icono nombre="chevron-izquierda" />
          Anterior
        </Link>
      ) : (
        <span aria-disabled="true" className={INACTIVO}>
          <Icono nombre="chevron-izquierda" />
          Anterior
        </span>
      )}
      <p className="text-dense text-ink-muted tabular-nums">
        Página {pagina} de {totalPaginas}
      </p>
      {haySiguiente ? (
        <Link href={hrefDePagina(pagina + 1)} className={ENLACE}>
          Siguiente
          <Icono nombre="chevron-derecha" />
        </Link>
      ) : (
        <span aria-disabled="true" className={INACTIVO}>
          Siguiente
          <Icono nombre="chevron-derecha" />
        </span>
      )}
    </nav>
  );
}
