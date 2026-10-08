import type { ReactElement } from 'react';
import { EnlaceBoton } from '@/shared/components/acciones';
import { ChipEstado, InsigniaLinea } from '@/shared/components/datos';
import { TablaDatos, type Columna } from '@/shared/components/tabla';
import { Icono, TextoOculto } from '@/shared/components/utilidades';
import type { EstacionListado } from '../schemas/estacion';
import { SinResultados } from './sin-resultados';

type Propiedades = Readonly<{
  estaciones: readonly EstacionListado[];
  /** Estación del operador; se resalta. */
  estacionResaltadaId?: number;
  hayFiltros: boolean;
}>;

function Lineas({ estacion }: Readonly<{ estacion: EstacionListado }>): ReactElement {
  if (estacion.sinLinea) {
    return <ChipEstado estado="advertencia">Sin línea</ChipEstado>;
  }
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label={`Líneas que pasan por ${estacion.nombre}`}>
      {estacion.lineas.map((linea) => (
        <li key={linea.id}>
          <InsigniaLinea codigo={linea.codigo} />
        </li>
      ))}
    </ul>
  );
}

function columnas(resaltadaId?: number): Columna<EstacionListado>[] {
  return [
    {
      clave: 'estacion',
      encabezado: 'Estación',
      fija: true,
      celda: (e) => (
        <span className="flex flex-col">
          <span className="text-label">
            {e.codigo} · {e.nombre}
          </span>
          {e.id === resaltadaId ? <span className="text-ink-muted">Tu estación</span> : null}
        </span>
      ),
    },
    { clave: 'municipalidad', encabezado: 'Municipalidad', celda: (e) => e.municipalidad.nombre },
    { clave: 'lineas', encabezado: 'Líneas', celda: (e) => <Lineas estacion={e} /> },
    {
      clave: 'parqueo',
      encabezado: 'Parqueo',
      celda: (e) => (
        <span className="inline-flex items-center gap-2">
          <Icono nombre="parqueo" tamano={16} />
          {e.tieneParqueo ? 'Con parqueo' : 'Sin parqueo'}
        </span>
      ),
    },
    {
      clave: 'acciones',
      encabezado: 'Acciones',
      celda: (e) => (
        <EnlaceBoton href={`/estaciones/${e.id}`} variante="fantasma" tamano="denso">
          Abrir<TextoOculto> {`estación ${e.codigo}`}</TextoOculto>
        </EnlaceBoton>
      ),
    },
  ];
}

/** Listado de estaciones con las líneas que pasan por cada una. */
export function TablaEstaciones({
  estaciones,
  estacionResaltadaId,
  hayFiltros,
}: Propiedades): ReactElement {
  return (
    <TablaDatos
      id="tabla-estaciones"
      titulo="Estaciones de la red"
      columnas={columnas(estacionResaltadaId)}
      filas={estaciones}
      claveDeFila={(estacion) => String(estacion.id)}
      seleccionada={(estacion) => estacion.id === estacionResaltadaId}
      vacio={
        <SinResultados hayFiltros={hayFiltros} hrefLimpiar="/estaciones" objeto="estaciones" />
      }
    />
  );
}
