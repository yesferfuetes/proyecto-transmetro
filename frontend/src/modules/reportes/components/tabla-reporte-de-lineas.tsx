import type { ReactElement } from 'react';
import { InsigniaLinea } from '@/shared/components/datos';
import { TablaDatos, type Columna } from '@/shared/components/tabla';
import { formatearKm } from '@/shared/lib/formato';
import type { FilaDeLinea } from '../schemas/reportes';
import { EstadoDeLaFlota } from './estado-de-flota';
import { etiquetaDeEstadoDeLinea } from './presentacion';
import { SinResultados } from './sin-resultados';

type Propiedades = Readonly<{ lineas: readonly FilaDeLinea[] }>;

const COLUMNAS: Columna<FilaDeLinea>[] = [
  {
    clave: 'linea',
    encabezado: 'Línea',
    fija: true,
    celda: (l) => (
      <span className="flex items-center gap-3">
        <InsigniaLinea codigo={l.codigo} />
        <span className="text-label">{l.nombre}</span>
      </span>
    ),
  },
  { clave: 'municipalidad', encabezado: 'Municipalidad', celda: (l) => l.municipalidad.nombre },
  { clave: 'estado', encabezado: 'Estado', celda: (l) => etiquetaDeEstadoDeLinea(l.estado) },
  { clave: 'estaciones', encabezado: 'Estaciones', alineacion: 'fin', celda: (l) => l.estaciones },
  {
    clave: 'longitud',
    encabezado: 'Longitud',
    alineacion: 'fin',
    celda: (l) => formatearKm(l.longitudKm),
  },
  { clave: 'buses', encabezado: 'Buses', alineacion: 'fin', celda: (l) => l.buses },
  { clave: 'minimo', encabezado: 'Mínimo', alineacion: 'fin', celda: (l) => l.minimo },
  { clave: 'maximo', encabezado: 'Máximo', alineacion: 'fin', celda: (l) => l.maximo },
  {
    clave: 'flota',
    encabezado: 'Estado de la flota',
    celda: (l) => <EstadoDeLaFlota estado={l.estadoDeFlota} />,
  },
];

/** Líneas con su municipalidad, estaciones, longitud, buses y estado de la flota. */
export function TablaReporteDeLineas({ lineas }: Propiedades): ReactElement {
  return (
    <TablaDatos
      id="tabla-reporte-de-lineas"
      titulo="Reporte de líneas"
      columnas={COLUMNAS}
      filas={lineas}
      claveDeFila={(linea) => String(linea.id)}
      vacio={
        <SinResultados
          hrefLimpiar="/reportes"
          textoDelEnlace="Elegir otros filtros"
          objeto="líneas"
        />
      }
    />
  );
}
