import type { ReactElement } from 'react';
import { BarraFiltros, FiltroBusqueda } from '@/shared/components/tabla';
import type { FiltrosGuardias as Filtros } from '../schemas/guardia';

type Propiedades = Readonly<{ filtros: Filtros; total: number }>;

/** Búsqueda de guardias por nombre o DPI; vive en la URL y la aplica el servidor. */
export function FiltrosGuardias({ filtros, total }: Propiedades): ReactElement {
  return (
    <BarraFiltros
      accion="/guardias"
      etiqueta="Filtros de guardias"
      total={total}
      hayFiltros={filtros.busqueda !== undefined}
      hrefLimpiar="/guardias"
    >
      <FiltroBusqueda
        nombre="busqueda"
        etiqueta="Buscar por nombre o DPI"
        valor={filtros.busqueda}
      />
    </BarraFiltros>
  );
}
