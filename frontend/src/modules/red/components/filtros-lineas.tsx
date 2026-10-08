import type { ReactElement } from 'react';
import { BarraFiltros, FiltroOpcion, FiltroSeleccion } from '@/shared/components/tabla';
import { ETIQUETA_DE_ESTADO, esquemaEstadoLinea } from '../schemas/comunes';
import type { FiltrosLineas as Filtros } from '../schemas/linea';
import type { MunicipalidadListado } from '../schemas/municipalidad';
import { hrefConFiltros } from './presentacion';

type Propiedades = Readonly<{
  filtros: Filtros;
  municipalidades: readonly MunicipalidadListado[];
  total: number;
}>;

/** Filtros del listado de líneas; viven en la URL y los aplica el servidor. */
export function FiltrosLineas({ filtros, municipalidades, total }: Propiedades): ReactElement {
  const hayFiltros = filtros.municipalidadId !== undefined || filtros.estado !== undefined;
  return (
    <BarraFiltros
      accion="/lineas"
      etiqueta="Filtros de líneas"
      total={total}
      hayFiltros={hayFiltros}
      hrefLimpiar="/lineas"
    >
      <FiltroSeleccion
        nombre="municipalidadId"
        etiqueta="Municipalidad"
        valor={filtros.municipalidadId?.toString()}
        opciones={municipalidades.map((m) => ({ valor: String(m.id), etiqueta: m.nombre }))}
      />
      {filtros.estado ? <input type="hidden" name="estado" value={filtros.estado} /> : null}
      {esquemaEstadoLinea.options.map((estado) => {
        const activo = filtros.estado === estado;
        return (
          <FiltroOpcion
            key={estado}
            activo={activo}
            href={hrefConFiltros('/lineas', {
              municipalidadId: filtros.municipalidadId,
              estado: activo ? undefined : estado,
            })}
          >
            {ETIQUETA_DE_ESTADO[estado]}
          </FiltroOpcion>
        );
      })}
    </BarraFiltros>
  );
}
