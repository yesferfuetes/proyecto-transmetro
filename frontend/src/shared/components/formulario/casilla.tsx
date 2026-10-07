import type { InputHTMLAttributes, ReactElement } from 'react';

type Propiedades = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> &
  Readonly<{ etiqueta: string }>;

/** Casilla nativa con su etiqueta a la derecha. */
export function Casilla({ etiqueta, ...atributos }: Propiedades): ReactElement {
  return (
    <label className="inline-flex min-h-control items-center gap-3 text-dense text-ink">
      <input
        type="checkbox"
        className="size-5 rounded-sm accent-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
        {...atributos}
      />
      {etiqueta}
    </label>
  );
}
