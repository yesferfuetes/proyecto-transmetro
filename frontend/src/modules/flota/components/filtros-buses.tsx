import type { ReactElement } from 'react';
import { PuntoLinea } from '@/shared/components/datos';
import {
  BarraFiltros,
  FiltroBusqueda,
  FiltroOpcion,
  FiltroSeleccion,
} from '@/shared/components/tabla';
import {
  esquemaEstadoDeBus,
  ETIQUETA_DE_ESTADO_DE_BUS,
  type FiltrosBuses as Filtros,
} from '../schemas/bus';
import type { Referencia } from '../schemas/comunes';
import type { Parqueo } from '../schemas/parqueo';
import { hrefConFiltros } from './presentacion';

type Propiedades = Readonly<{
  filtros: Filtros;
  lineas: readonly Referencia[];
  parqueos: readonly Parqueo[];
  total: number;
}>;

export function hayFiltrosDeBuses(filtros: Filtros): boolean {
  return (
    filtros.lineaId !== undefined ||
    filtros.sinLinea !== undefined ||
    filtros.estado !== undefined ||
    filtros.parqueoId !== undefined ||
    filtros.busqueda !== undefined
  );
}

function enlace(filtros: Filtros, cambio: Partial<Filtros>): string {
  const { pagina: _pagina, ...base } = { ...filtros, ...cambio };
  return hrefConFiltros('/flota', base);
}

/** Filtros por línea, estado, parqueo y placa; viven en la URL y los aplica el servidor. */
export function FiltrosBuses({ filtros, lineas, parqueos, total }: Propiedades): ReactElement {
  return (
    <BarraFiltros
      accion="/flota"
      etiqueta="Filtros de buses"
      total={total}
      hayFiltros={hayFiltrosDeBuses(filtros)}
      hrefLimpiar="/flota"
    >
      <FiltroBusqueda nombre="busqueda" etiqueta="Buscar por placa" valor={filtros.busqueda} />
      {filtros.lineaId ? <input type="hidden" name="lineaId" value={filtros.lineaId} /> : null}
      {filtros.sinLinea ? <input type="hidden" name="sinLinea" value="1" /> : null}
      {filtros.estado ? <input type="hidden" name="estado" value={filtros.estado} /> : null}
      <FiltroSeleccion
        nombre="parqueoId"
        etiqueta="Parqueo"
        valor={filtros.parqueoId?.toString()}
        opciones={parqueos.map((p) => ({
          valor: String(p.id),
          etiqueta: `${p.estacion.nombre} · ${p.codigo}`,
        }))}
      />
      {lineas.map((linea) => {
        const activo = filtros.lineaId === linea.id;
        return (
          <FiltroOpcion
            key={linea.id}
            activo={activo}
            href={enlace(filtros, { lineaId: activo ? undefined : linea.id, sinLinea: undefined })}
          >
            <PuntoLinea codigo={linea.codigo} nombre={linea.nombre} />
          </FiltroOpcion>
        );
      })}
      <FiltroOpcion
        activo={filtros.sinLinea !== undefined}
        href={enlace(filtros, {
          sinLinea: filtros.sinLinea ? undefined : '1',
          lineaId: undefined,
        })}
      >
        Sin línea
      </FiltroOpcion>
      {esquemaEstadoDeBus.options.map((estado) => {
        const activo = filtros.estado === estado;
        return (
          <FiltroOpcion
            key={estado}
            activo={activo}
            href={enlace(filtros, { estado: activo ? undefined : estado })}
          >
            {ETIQUETA_DE_ESTADO_DE_BUS[estado]}
          </FiltroOpcion>
        );
      })}
    </BarraFiltros>
  );
}
