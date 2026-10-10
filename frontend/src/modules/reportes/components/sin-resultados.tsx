import type { ReactElement } from 'react';
import { EnlaceBoton } from '@/shared/components/acciones';
import { EstadoVacio } from '@/shared/components/datos';

type Propiedades = Readonly<{
  hrefLimpiar: string;
  textoDelEnlace: string;
  /** Qué no tiene resultados, en plural: "estaciones", "consultas". */
  objeto: string;
}>;

/** Lo que muestra una tabla vacía: no es un error, los filtros no dejaron nada. */
export function SinResultados({ hrefLimpiar, textoDelEnlace, objeto }: Propiedades): ReactElement {
  return (
    <EstadoVacio
      variante="sin-resultados"
      titulo="Sin resultados"
      texto={`Ninguna de las ${objeto} cumple los filtros elegidos.`}
      accion={
        <EnlaceBoton href={hrefLimpiar} variante="secundario">
          {textoDelEnlace}
        </EnlaceBoton>
      }
    />
  );
}
