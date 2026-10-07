import type { ReactElement, ReactNode } from 'react';
import { TituloDosTonos } from './titulo-dos-tonos';

type Propiedades = Readonly<{
  destacado: string;
  resto: string;
  descripcion?: string;
  acciones?: ReactNode;
}>;

/** Título de página a dos tonos, descripción y acciones (abajo en móvil, a la derecha después). */
export function EncabezadoPagina({
  destacado,
  resto,
  descripcion,
  acciones,
}: Propiedades): ReactElement {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-2">
        <TituloDosTonos nivel={1} destacado={destacado} resto={resto} />
        {descripcion ? <p className="text-body text-ink-muted">{descripcion}</p> : null}
      </div>
      {acciones ? <div className="flex flex-wrap gap-3">{acciones}</div> : null}
    </header>
  );
}
