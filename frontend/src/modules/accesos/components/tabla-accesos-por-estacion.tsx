import type { ReactElement } from 'react';
import { TablaDatos, type Columna } from '@/shared/components/tabla';
import type { EstacionConAccesos } from '../schemas/acceso';
import { ListaDeAccesos } from './lista-de-accesos';
import { SinResultados } from './sin-resultados';

type Propiedades = Readonly<{
  estaciones: readonly EstacionConAccesos[];
  /** Estación del operador; se resalta. */
  estacionResaltadaId?: number;
  hayFiltros: boolean;
}>;

function columnas(resaltadaId?: number): Columna<EstacionConAccesos>[] {
  return [
    {
      clave: 'estacion',
      encabezado: 'Estación',
      fija: true,
      celda: ({ estacion }) => (
        <span className="flex flex-col">
          <span className="text-label">
            {estacion.codigo} · {estacion.nombre}
          </span>
          {estacion.id === resaltadaId ? <span className="text-ink-muted">Tu estación</span> : null}
        </span>
      ),
    },
    {
      clave: 'accesos',
      encabezado: 'Accesos',
      celda: (fila) => <ListaDeAccesos accesos={fila.accesos} estacion={fila.estacion.nombre} />,
    },
  ];
}

/** Estaciones con todos sus accesos y cuántos guardias cubre cada uno. */
export function TablaAccesosPorEstacion({
  estaciones,
  estacionResaltadaId,
  hayFiltros,
}: Propiedades): ReactElement {
  return (
    <TablaDatos
      id="tabla-accesos"
      titulo="Accesos por estación"
      columnas={columnas(estacionResaltadaId)}
      filas={estaciones}
      claveDeFila={({ estacion }) => String(estacion.id)}
      seleccionada={({ estacion }) => estacion.id === estacionResaltadaId}
      vacio={<SinResultados hayFiltros={hayFiltros} hrefLimpiar="/accesos" objeto="accesos" />}
    />
  );
}
