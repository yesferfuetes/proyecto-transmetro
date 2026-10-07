import type { InputHTMLAttributes, ReactElement } from 'react';
import { cn } from '@/shared/lib/cn';
import { CONTROL } from './estilos-campo';

type Propiedades = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> &
  Readonly<{ unidad?: string }>;

/** Campo numérico con cifras tabulares y la unidad visible como sufijo. */
export function CampoNumero({ unidad, className, ...atributos }: Propiedades): ReactElement {
  return (
    <span className="relative flex items-center">
      <input
        type="number"
        inputMode="decimal"
        className={cn(CONTROL, 'tabular-nums', unidad ? 'pe-14' : null, className)}
        {...atributos}
      />
      {unidad ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute end-3 text-dense text-ink-muted"
        >
          {unidad}
        </span>
      ) : null}
    </span>
  );
}
