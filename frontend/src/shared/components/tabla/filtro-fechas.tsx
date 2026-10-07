import type { ReactElement } from 'react';
import { cn } from '@/shared/lib/cn';
import { FILTRO_INACTIVO, PILDORA_FILTRO } from './estilos-filtro';

type Propiedades = Readonly<{
  etiqueta: string;
  nombreDesde: string;
  nombreHasta: string;
  desde?: string;
  hasta?: string;
}>;

const CAMPO = 'bg-transparent text-dense text-ink tabular-nums focus:outline-none';

/** Rango de fechas en una sola píldora. */
export function FiltroFechas({
  etiqueta,
  nombreDesde,
  nombreHasta,
  desde,
  hasta,
}: Propiedades): ReactElement {
  return (
    <fieldset className={cn(PILDORA_FILTRO, FILTRO_INACTIVO)}>
      <legend className="sr-only">{etiqueta}</legend>
      <input
        type="date"
        name={nombreDesde}
        aria-label={`${etiqueta}: desde`}
        defaultValue={desde}
        className={CAMPO}
      />
      <span aria-hidden="true">–</span>
      <input
        type="date"
        name={nombreHasta}
        aria-label={`${etiqueta}: hasta`}
        defaultValue={hasta}
        className={CAMPO}
      />
    </fieldset>
  );
}
