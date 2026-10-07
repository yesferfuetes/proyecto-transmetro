import Link from 'next/link';
import type { ReactElement, ReactNode } from 'react';

const FORMATO = new Intl.NumberFormat('es-GT');

type Propiedades = Readonly<{
  /** Ruta a la que se envía el formulario GET: los filtros viven en la URL. */
  accion: string;
  etiqueta: string;
  total: number;
  hayFiltros: boolean;
  hrefLimpiar: string;
  children: ReactNode;
}>;

/** Filtros en píldora. Funciona sin JavaScript: es un formulario GET. */
export function BarraFiltros({
  accion,
  etiqueta,
  total,
  hayFiltros,
  hrefLimpiar,
  children,
}: Propiedades): ReactElement {
  return (
    <form
      action={accion}
      method="get"
      aria-label={etiqueta}
      className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
    >
      <div className="-mx-gutter flex gap-2 overflow-x-auto px-gutter py-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
        {children}
        <noscript>
          <button
            type="submit"
            className="h-control rounded-full bg-primary px-4 text-label text-ink-inverse"
          >
            Aplicar
          </button>
        </noscript>
      </div>
      <div className="flex items-center gap-4 text-dense text-ink-muted">
        <p aria-live="polite" className="tabular-nums">
          {FORMATO.format(total)} {total === 1 ? 'resultado' : 'resultados'}
        </p>
        {hayFiltros ? (
          <Link
            href={hrefLimpiar}
            className="rounded-full px-3 py-2 text-label text-primary hover:bg-primary-soft focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          >
            Limpiar filtros
          </Link>
        ) : null}
      </div>
    </form>
  );
}
