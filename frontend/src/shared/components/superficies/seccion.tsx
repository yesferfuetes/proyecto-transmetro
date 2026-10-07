import type { ReactElement, ReactNode } from 'react';
import { TituloDosTonos } from './titulo-dos-tonos';

type Propiedades = Readonly<{
  /** Identificador único en la página; el título se enlaza con él. */
  id: string;
  destacado: string;
  resto: string;
  orden?: 'destacado-primero' | 'destacado-ultimo';
  acciones?: ReactNode;
  children: ReactNode;
}>;

/** Sección con su título a dos tonos como nombre accesible. */
export function Seccion({
  id,
  destacado,
  resto,
  orden,
  acciones,
  children,
}: Propiedades): ReactElement {
  const idTitulo = `${id}-titulo`;
  return (
    <section aria-labelledby={idTitulo} className="mt-section flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <TituloDosTonos nivel={2} id={idTitulo} destacado={destacado} resto={resto} orden={orden} />
        {acciones}
      </div>
      {children}
    </section>
  );
}
