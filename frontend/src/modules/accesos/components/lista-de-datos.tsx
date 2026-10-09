import type { ReactElement, ReactNode } from 'react';

export type Dato = Readonly<{ clave: string; etiqueta: string; valor: ReactNode }>;

type Propiedades = Readonly<{ datos: readonly Dato[] }>;

/** Pares etiqueta–valor de una ficha de detalle. */
export function ListaDeDatos({ datos }: Propiedades): ReactElement {
  return (
    <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {datos.map((dato) => (
        <div key={dato.clave} className="flex flex-col gap-1">
          <dt className="text-eyebrow text-ink-muted uppercase">{dato.etiqueta}</dt>
          <dd className="text-body text-ink">{dato.valor}</dd>
        </div>
      ))}
    </dl>
  );
}
