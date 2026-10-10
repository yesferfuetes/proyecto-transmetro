import type { ReactElement } from 'react';
import { PuntoLinea } from '@/shared/components/datos';
import {
  BarraFiltros,
  FiltroBusqueda,
  FiltroOpcion,
  FiltroSeleccion,
} from '@/shared/components/tabla';
import type { Referencia } from '../schemas/comunes';
import type { FiltrosPilotos as Filtros, Opciones, VistaDePilotos } from '../schemas/piloto';
import { hrefConFiltros } from './presentacion';

type Propiedades = Readonly<{
  filtros: Filtros;
  lineas: readonly Referencia[];
  buses: Opciones['buses'];
  vista: VistaDePilotos;
  total: number;
}>;

export function hayFiltrosDePilotos(filtros: Filtros): boolean {
  return (
    filtros.lineaId !== undefined ||
    filtros.busId !== undefined ||
    filtros.sinBus !== undefined ||
    filtros.busqueda !== undefined
  );
}

function enlace(filtros: Filtros, cambio: Partial<Filtros>): string {
  const { pagina: _pagina, ...base } = { ...filtros, ...cambio };
  return hrefConFiltros('/pilotos', base);
}

/** Filtros por línea, bus, "sin bus" y búsqueda; viven en la URL y los aplica el servidor. */
export function FiltrosPilotos({
  filtros,
  lineas,
  buses,
  vista,
  total,
}: Propiedades): ReactElement {
  return (
    <BarraFiltros
      accion="/pilotos"
      etiqueta="Filtros de pilotos"
      total={total}
      hayFiltros={hayFiltrosDePilotos(filtros)}
      hrefLimpiar="/pilotos"
    >
      <FiltroBusqueda
        nombre="busqueda"
        etiqueta={vista === 'completa' ? 'Buscar por nombre o DPI' : 'Buscar por nombre'}
        valor={filtros.busqueda}
      />
      {filtros.lineaId ? <input type="hidden" name="lineaId" value={filtros.lineaId} /> : null}
      {filtros.sinBus ? <input type="hidden" name="sinBus" value="1" /> : null}
      <FiltroSeleccion
        nombre="busId"
        etiqueta="Bus"
        valor={filtros.busId?.toString()}
        opciones={buses.map((bus) => ({ valor: String(bus.id), etiqueta: bus.placa }))}
      />
      {lineas.map((linea) => {
        const activo = filtros.lineaId === linea.id;
        return (
          <FiltroOpcion
            key={linea.id}
            activo={activo}
            href={enlace(filtros, { lineaId: activo ? undefined : linea.id, sinBus: undefined })}
          >
            <PuntoLinea codigo={linea.codigo} nombre={linea.nombre} />
          </FiltroOpcion>
        );
      })}
      <FiltroOpcion
        activo={filtros.sinBus !== undefined}
        href={enlace(filtros, {
          sinBus: filtros.sinBus ? undefined : '1',
          lineaId: undefined,
          busId: undefined,
        })}
      >
        Sin bus
      </FiltroOpcion>
    </BarraFiltros>
  );
}
