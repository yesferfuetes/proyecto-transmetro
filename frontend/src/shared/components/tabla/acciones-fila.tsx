import type { ReactElement } from 'react';
import { Desplegable, type OpcionMenu } from '@/shared/components/superposiciones';

type Propiedades = Readonly<{
  /** Nombre accesible que identifica la fila, p. ej. "Acciones del bus P-123ABC". */
  etiqueta: string;
  acciones: readonly OpcionMenu[];
}>;

/** Menú de acciones de una fila de tabla. */
export function AccionesFila({ etiqueta, acciones }: Propiedades): ReactElement {
  return <Desplegable etiqueta={etiqueta} opciones={acciones} />;
}
