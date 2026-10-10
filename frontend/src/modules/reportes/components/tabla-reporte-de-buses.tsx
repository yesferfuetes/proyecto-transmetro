import type { ReactElement, ReactNode } from 'react';
import { ChipEstado, InsigniaLinea } from '@/shared/components/datos';
import { TablaDatos, type Columna } from '@/shared/components/tabla';
import type { FilaDeBus } from '../schemas/reportes';
import {
  ESTADO_VISUAL_DE_BUS,
  ETIQUETA_DE_ESTADO_DE_BUS,
  filasAgrupadasPorLinea,
  type FilaDeTablaDeBuses,
} from './presentacion';
import { SinResultados } from './sin-resultados';

type Propiedades = Readonly<{ buses: readonly FilaDeBus[] }>;

function EncabezadoDeGrupo({ linea }: Readonly<{ linea: FilaDeBus['linea'] }>): ReactElement {
  if (linea === null) {
    return <b>Sin línea</b>;
  }
  return (
    <span className="flex items-center gap-3">
      <InsigniaLinea codigo={linea.codigo} />
      <b>{linea.nombre}</b>
    </span>
  );
}

function celdaDeBus(fila: FilaDeTablaDeBuses, mostrar: (bus: FilaDeBus) => ReactNode): ReactNode {
  return fila.tipo === 'bus' ? mostrar(fila.bus) : null;
}

const COLUMNAS: Columna<FilaDeTablaDeBuses>[] = [
  {
    clave: 'placa',
    encabezado: 'Placa',
    fija: true,
    celda: (fila) =>
      fila.tipo === 'grupo' ? <EncabezadoDeGrupo linea={fila.linea} /> : <b>{fila.bus.placa}</b>,
  },
  {
    clave: 'capacidad',
    encabezado: 'Capacidad',
    alineacion: 'fin',
    celda: (fila) => celdaDeBus(fila, (bus) => String(bus.capacidadMax)),
  },
  {
    clave: 'estado',
    encabezado: 'Estado',
    celda: (fila) =>
      celdaDeBus(fila, (bus) => (
        <ChipEstado estado={ESTADO_VISUAL_DE_BUS[bus.estado]}>
          {ETIQUETA_DE_ESTADO_DE_BUS[bus.estado]}
        </ChipEstado>
      )),
  },
  {
    clave: 'parqueo',
    encabezado: 'Parqueo',
    celda: (fila) =>
      celdaDeBus(fila, (bus) => `${bus.parqueo.estacion.nombre} · ${bus.parqueo.codigo}`),
  },
];

/** Buses agrupados por línea; una fila de encabezado cada vez que cambia, y al final los sin línea. */
export function TablaReporteDeBuses({ buses }: Propiedades): ReactElement {
  return (
    <TablaDatos
      id="tabla-reporte-de-buses"
      titulo="Reporte de buses por línea"
      columnas={COLUMNAS}
      filas={filasAgrupadasPorLinea(buses)}
      claveDeFila={(fila) => fila.clave}
      seleccionada={(fila) => fila.tipo === 'grupo'}
      vacio={
        <SinResultados
          hrefLimpiar="/reportes"
          textoDelEnlace="Elegir otros filtros"
          objeto="buses"
        />
      }
    />
  );
}
