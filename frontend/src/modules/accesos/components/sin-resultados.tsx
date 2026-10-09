import type { ReactElement } from 'react';
import { EnlaceBoton } from '@/shared/components/acciones';
import { EstadoVacio } from '@/shared/components/datos';

type Propiedades = Readonly<{
  hayFiltros: boolean;
  hrefLimpiar: string;
  /** Cómo se llama lo que se lista, en plural: "líneas", "estaciones". */
  objeto: string;
}>;

/** Lo que muestra una tabla vacía: sin datos todavía, o sin resultados para los filtros. */
export function SinResultados({ hayFiltros, hrefLimpiar, objeto }: Propiedades): ReactElement {
  return hayFiltros ? (
    <EstadoVacio
      variante="sin-resultados"
      titulo="Sin resultados"
      texto={`Ninguna de las ${objeto} cumple los filtros elegidos.`}
      accion={
        <EnlaceBoton href={hrefLimpiar} variante="secundario">
          Limpiar filtros
        </EnlaceBoton>
      }
    />
  ) : (
    <EstadoVacio
      variante="sin-datos"
      titulo={`Aún no hay ${objeto}`}
      texto={`Cuando se registren ${objeto}, aparecerán aquí.`}
    />
  );
}
