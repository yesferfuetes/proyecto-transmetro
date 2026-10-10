import type { ReactElement } from 'react';
import { PuntoLinea } from '@/shared/components/datos';
import { BarraFiltros, FiltroOpcion, FiltroSeleccion } from '@/shared/components/tabla';
import {
  esquemaEstadoDeAlerta,
  esquemaTipoDeAlerta,
  ETIQUETA_DE_ESTADO,
  ETIQUETA_DE_TIPO,
  type FiltrosAlertas as Filtros,
  type OpcionesDeAlertas,
} from '../schemas/alerta';
import { hrefConFiltros } from './presentacion';

type Propiedades = Readonly<{
  filtros: Filtros;
  /** Solo para supervisor y administrador; el operador no filtra por estación ni línea. */
  opciones?: OpcionesDeAlertas;
  total: number;
}>;

export function hayFiltrosDeAlertas(filtros: Filtros): boolean {
  return (
    filtros.estado !== undefined ||
    filtros.tipo !== undefined ||
    filtros.estacion !== undefined ||
    filtros.linea !== undefined
  );
}

function enlace(filtros: Filtros, cambio: Partial<Filtros>): string {
  const { pagina: _pagina, resaltada: _resaltada, ...base } = { ...filtros, ...cambio };
  return hrefConFiltros('/alertas', base);
}

/** Filtros por estado, tipo y, para quien ve toda la red, estación y línea; viven en la URL. */
export function FiltrosAlertas({ filtros, opciones, total }: Propiedades): ReactElement {
  return (
    <BarraFiltros
      accion="/alertas"
      etiqueta="Filtros de alertas"
      total={total}
      hayFiltros={hayFiltrosDeAlertas(filtros)}
      hrefLimpiar="/alertas"
    >
      {filtros.estado ? <input type="hidden" name="estado" value={filtros.estado} /> : null}
      {filtros.tipo ? <input type="hidden" name="tipo" value={filtros.tipo} /> : null}
      {filtros.linea ? <input type="hidden" name="linea" value={filtros.linea} /> : null}
      {opciones ? (
        <FiltroSeleccion
          nombre="estacion"
          etiqueta="Estación"
          valor={filtros.estacion?.toString()}
          opciones={opciones.estaciones.map((e) => ({ valor: String(e.id), etiqueta: e.nombre }))}
        />
      ) : null}
      {esquemaEstadoDeAlerta.options.map((estado) => {
        const activo = filtros.estado === estado;
        return (
          <FiltroOpcion
            key={estado}
            activo={activo}
            href={enlace(filtros, { estado: activo ? undefined : estado })}
          >
            {ETIQUETA_DE_ESTADO[estado]}
          </FiltroOpcion>
        );
      })}
      {esquemaTipoDeAlerta.options.map((tipo) => {
        const activo = filtros.tipo === tipo;
        return (
          <FiltroOpcion
            key={tipo}
            activo={activo}
            href={enlace(filtros, { tipo: activo ? undefined : tipo })}
          >
            {ETIQUETA_DE_TIPO[tipo]}
          </FiltroOpcion>
        );
      })}
      {opciones?.lineas.map((linea) => {
        const activo = filtros.linea === linea.id;
        return (
          <FiltroOpcion
            key={linea.id}
            activo={activo}
            href={enlace(filtros, { linea: activo ? undefined : linea.id })}
          >
            <PuntoLinea codigo={linea.codigo} nombre={linea.nombre} />
          </FiltroOpcion>
        );
      })}
    </BarraFiltros>
  );
}
