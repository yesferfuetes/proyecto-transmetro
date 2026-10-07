import type { ReactElement } from 'react';
import type { Destino } from './destinos';
import { Mosaico } from './mosaico';

type Propiedades = Readonly<{ mosaicos: readonly Destino[] }>;

/**
 * Rejilla de accesos rápidos. Los mosaicos conservan su tamaño en todas las pantallas: con más
 * ancho se reorganizan en menos filas, no se estiran.
 */
export function RejillaMosaicos({ mosaicos }: Propiedades): ReactElement {
  return (
    <ul className="grid grid-cols-3 justify-items-center gap-x-4 gap-y-6 md:flex md:flex-wrap md:justify-start md:gap-6 lg:gap-8">
      {mosaicos.map((mosaico) => (
        <li key={mosaico.href}>
          <Mosaico href={mosaico.href} etiqueta={mosaico.etiqueta} icono={mosaico.icono} />
        </li>
      ))}
    </ul>
  );
}
