import type { ReactElement } from 'react';
import { EnlaceBoton } from '@/shared/components/acciones';
import { EstadoVacio } from '@/shared/components/datos';

type Propiedades = Readonly<{ hayFiltros: boolean }>;

/** Lo que muestra la tabla sin filas: sin alertas todavía, o sin resultados para los filtros. */
export function SinAlertas({ hayFiltros }: Propiedades): ReactElement {
  return hayFiltros ? (
    <EstadoVacio
      variante="sin-resultados"
      titulo="Sin resultados"
      texto="Ninguna alerta cumple los filtros elegidos."
      accion={
        <EnlaceBoton href="/alertas" variante="secundario">
          Limpiar filtros
        </EnlaceBoton>
      }
    />
  ) : (
    <EstadoVacio
      variante="sin-datos"
      titulo="Aún no hay alertas"
      texto="Cuando un operador registre una lectura que lo requiera, la alerta aparecerá aquí."
    />
  );
}
