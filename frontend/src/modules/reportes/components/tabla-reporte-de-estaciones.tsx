import type { ReactElement } from 'react';
import { InsigniaLinea } from '@/shared/components/datos';
import { TablaDatos, type Columna } from '@/shared/components/tabla';
import type { FilaDeEstacion } from '../schemas/reportes';
import { SinResultados } from './sin-resultados';

type Propiedades = Readonly<{ estaciones: readonly FilaDeEstacion[] }>;

const COLUMNAS: Columna<FilaDeEstacion>[] = [
  { clave: 'codigo', encabezado: 'Código', fija: true, celda: (e) => <b>{e.codigo}</b> },
  { clave: 'nombre', encabezado: 'Nombre', celda: (e) => e.nombre },
  { clave: 'municipalidad', encabezado: 'Municipalidad', celda: (e) => e.municipalidad.nombre },
  {
    clave: 'lineas',
    encabezado: 'Líneas',
    celda: (e) =>
      e.lineas.length === 0 ? (
        <span className="text-ink-muted">Sin líneas</span>
      ) : (
        <ul className="flex gap-1">
          {e.lineas.map((linea) => (
            <li key={linea.id}>
              <InsigniaLinea codigo={linea.codigo} />
            </li>
          ))}
        </ul>
      ),
  },
  { clave: 'parqueo', encabezado: 'Parqueo', celda: (e) => (e.tieneParqueo ? 'Sí' : 'No') },
];

/** Estaciones con su municipalidad, las líneas que pasan por ellas y si tienen parqueo. */
export function TablaReporteDeEstaciones({ estaciones }: Propiedades): ReactElement {
  return (
    <TablaDatos
      id="tabla-reporte-de-estaciones"
      titulo="Reporte de estaciones"
      columnas={COLUMNAS}
      filas={estaciones}
      claveDeFila={(estacion) => String(estacion.id)}
      vacio={
        <SinResultados
          hrefLimpiar="/reportes"
          textoDelEnlace="Elegir otros filtros"
          objeto="estaciones"
        />
      }
    />
  );
}
