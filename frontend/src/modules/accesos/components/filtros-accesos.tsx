import type { ReactElement } from 'react';
import { PuntoLinea } from '@/shared/components/datos';
import {
  BarraFiltros,
  FiltroBusqueda,
  FiltroOpcion,
  FiltroSeleccion,
} from '@/shared/components/tabla';
import type { FiltrosAccesos as Filtros, ReferenciaDeEstacion } from '../schemas/acceso';
import type { OpcionDeLinea } from '../schemas/linea';
import { hrefConFiltros } from './presentacion';

type Propiedades = Readonly<{
  filtros: Filtros;
  estaciones: readonly ReferenciaDeEstacion[];
  lineas: readonly OpcionDeLinea[];
  total: number;
}>;

function hayFiltrosActivos(filtros: Filtros): boolean {
  return [filtros.lineaId, filtros.estacionId, filtros.busqueda].some(
    (valor) => valor !== undefined,
  );
}

/** Filtros del listado de accesos; viven en la URL y los aplica el servidor. */
export function FiltrosAccesos({ filtros, estaciones, lineas, total }: Propiedades): ReactElement {
  const actuales = {
    lineaId: filtros.lineaId,
    estacionId: filtros.estacionId,
    busqueda: filtros.busqueda,
  };
  return (
    <BarraFiltros
      accion="/accesos"
      etiqueta="Filtros de accesos"
      total={total}
      hayFiltros={hayFiltrosActivos(filtros)}
      hrefLimpiar="/accesos"
    >
      <FiltroBusqueda
        nombre="busqueda"
        etiqueta="Buscar por código o nombre de estación"
        valor={filtros.busqueda}
      />
      <FiltroSeleccion
        nombre="estacionId"
        etiqueta="Estación"
        valor={filtros.estacionId?.toString()}
        opciones={estaciones.map((e) => ({
          valor: String(e.id),
          etiqueta: `${e.codigo} · ${e.nombre}`,
        }))}
      />
      {filtros.lineaId ? <input type="hidden" name="lineaId" value={filtros.lineaId} /> : null}
      {lineas.map((linea) => {
        const activo = filtros.lineaId === linea.id;
        return (
          <FiltroOpcion
            key={linea.id}
            activo={activo}
            href={hrefConFiltros('/accesos', {
              ...actuales,
              lineaId: activo ? undefined : linea.id,
            })}
          >
            <PuntoLinea codigo={linea.codigo} nombre={linea.nombre} />
          </FiltroOpcion>
        );
      })}
    </BarraFiltros>
  );
}
