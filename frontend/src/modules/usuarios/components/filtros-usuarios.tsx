import type { ReactElement } from 'react';
import {
  BarraFiltros,
  FiltroBusqueda,
  FiltroOpcion,
  FiltroSeleccion,
  type OpcionFiltro,
} from '@/shared/components/tabla';
import { esquemaRol, ETIQUETA_DE_ROL } from '@/shared/schemas/sesion';
import type { EstacionAsignable, FiltrosUsuarios as Filtros } from '../schemas/usuario';
import { hayFiltros, hrefDelListado } from './enlaces';

const OPCIONES_DE_ROL: readonly OpcionFiltro[] = esquemaRol.options.map((rol) => ({
  valor: rol,
  etiqueta: ETIQUETA_DE_ROL[rol],
}));

const ESTADOS = [
  { valor: 'true', etiqueta: 'Activos' },
  { valor: 'false', etiqueta: 'Inactivos' },
] as const;

type Propiedades = Readonly<{
  filtros: Filtros;
  estaciones: readonly EstacionAsignable[];
  total: number;
}>;

/** Filtros del listado en la URL: rol, estación, estado y búsqueda por nombre o correo. */
export function FiltrosUsuarios({ filtros, estaciones, total }: Propiedades): ReactElement {
  return (
    <BarraFiltros
      accion="/usuarios"
      etiqueta="Filtros de usuarios"
      total={total}
      hayFiltros={hayFiltros(filtros)}
      hrefLimpiar="/usuarios"
    >
      <FiltroBusqueda
        nombre="busqueda"
        etiqueta="Buscar por nombre o correo"
        valor={filtros.busqueda}
      />
      <FiltroSeleccion
        nombre="rol"
        etiqueta="Rol"
        opciones={OPCIONES_DE_ROL}
        valor={filtros.rol}
        etiquetaTodas="Todos"
      />
      <FiltroSeleccion
        nombre="estacionId"
        etiqueta="Estación"
        opciones={estaciones.map((estacion) => ({
          valor: String(estacion.id),
          etiqueta: `${estacion.codigo} · ${estacion.nombre}`,
        }))}
        valor={filtros.estacionId === undefined ? undefined : String(filtros.estacionId)}
      />
      {filtros.activo === undefined ? null : (
        <input type="hidden" name="activo" value={filtros.activo} />
      )}
      {ESTADOS.map((estado) => {
        const activo = filtros.activo === estado.valor;
        return (
          <FiltroOpcion
            key={estado.valor}
            activo={activo}
            href={hrefDelListado({
              ...filtros,
              activo: activo ? undefined : estado.valor,
              pagina: 1,
            })}
          >
            {estado.etiqueta}
          </FiltroOpcion>
        );
      })}
    </BarraFiltros>
  );
}
