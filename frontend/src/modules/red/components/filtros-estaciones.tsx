import type { ReactElement } from 'react';
import { PuntoLinea } from '@/shared/components/datos';
import {
  BarraFiltros,
  FiltroBusqueda,
  FiltroOpcion,
  FiltroSeleccion,
} from '@/shared/components/tabla';
import type { FiltrosEstaciones as Filtros } from '../schemas/estacion';
import type { LineaListado } from '../schemas/linea';
import type { MunicipalidadListado } from '../schemas/municipalidad';
import { hrefConFiltros } from './presentacion';

type Propiedades = Readonly<{
  filtros: Filtros;
  municipalidades: readonly MunicipalidadListado[];
  lineas: readonly LineaListado[];
  total: number;
}>;

const PARQUEO = [
  { valor: 'true', etiqueta: 'Con parqueo' },
  { valor: 'false', etiqueta: 'Sin parqueo' },
] as const;

function hayFiltrosActivos(filtros: Filtros): boolean {
  return [filtros.municipalidadId, filtros.lineaId, filtros.tieneParqueo, filtros.busqueda].some(
    (valor) => valor !== undefined,
  );
}

/** Filtros del listado de estaciones; viven en la URL y los aplica el servidor. */
export function FiltrosEstaciones({
  filtros,
  municipalidades,
  lineas,
  total,
}: Propiedades): ReactElement {
  const actuales = {
    municipalidadId: filtros.municipalidadId,
    lineaId: filtros.lineaId,
    tieneParqueo: filtros.tieneParqueo,
    busqueda: filtros.busqueda,
  };
  return (
    <BarraFiltros
      accion="/estaciones"
      etiqueta="Filtros de estaciones"
      total={total}
      hayFiltros={hayFiltrosActivos(filtros)}
      hrefLimpiar="/estaciones"
    >
      <FiltroBusqueda
        nombre="busqueda"
        etiqueta="Buscar por código o nombre"
        valor={filtros.busqueda}
      />
      <FiltroSeleccion
        nombre="municipalidadId"
        etiqueta="Municipalidad"
        valor={filtros.municipalidadId?.toString()}
        opciones={municipalidades.map((m) => ({ valor: String(m.id), etiqueta: m.nombre }))}
      />
      {filtros.lineaId ? <input type="hidden" name="lineaId" value={filtros.lineaId} /> : null}
      {filtros.tieneParqueo ? (
        <input type="hidden" name="tieneParqueo" value={filtros.tieneParqueo} />
      ) : null}
      {lineas.map((linea) => {
        const activo = filtros.lineaId === linea.id;
        return (
          <FiltroOpcion
            key={linea.id}
            activo={activo}
            href={hrefConFiltros('/estaciones', {
              ...actuales,
              lineaId: activo ? undefined : linea.id,
            })}
          >
            <PuntoLinea codigo={linea.codigo} nombre={linea.nombre} />
          </FiltroOpcion>
        );
      })}
      {PARQUEO.map((opcion) => {
        const activo = filtros.tieneParqueo === opcion.valor;
        return (
          <FiltroOpcion
            key={opcion.valor}
            activo={activo}
            href={hrefConFiltros('/estaciones', {
              ...actuales,
              tieneParqueo: activo ? undefined : opcion.valor,
            })}
          >
            {opcion.etiqueta}
          </FiltroOpcion>
        );
      })}
    </BarraFiltros>
  );
}
