import type { BusConParqueo, FlotaDeLineaResumen } from '../../shared/contratos/flota';
import type { RedCompleta } from '../../shared/contratos/red';
import {
  armarReporteDeBuses,
  armarReporteDeEstaciones,
  armarReporteDeLineas,
} from './armar-reportes';
import { aCsv, nombreDeArchivo } from './csv';
import type { FiltrosDeReporte, TipoDeReporte } from './tipos-de-reporte';

export interface ArchivoExportado {
  nombreDeArchivo: string;
  contenido: string;
}

const SIN_LINEA = 'Sin línea';

function csvDeEstaciones(
  red: RedCompleta,
  buses: readonly BusConParqueo[],
  f: FiltrosDeReporte,
): string {
  const filas = armarReporteDeEstaciones(red, buses, f).map((e) => [
    e.codigo,
    e.nombre,
    e.municipalidad.nombre,
    e.lineas.map((l) => l.codigo).join('; '),
    e.tieneParqueo ? 'Sí' : 'No',
  ]);
  return aCsv(['Código', 'Nombre', 'Municipalidad', 'Líneas', 'Parqueo'], filas);
}

function csvDeLineas(
  red: RedCompleta,
  buses: readonly BusConParqueo[],
  flota: readonly FlotaDeLineaResumen[],
  f: FiltrosDeReporte,
): string {
  const filas = armarReporteDeLineas(red, buses, flota, f).map((l) => [
    l.codigo,
    l.nombre,
    l.municipalidad.nombre,
    l.estado,
    l.estaciones,
    l.longitudKm,
    l.buses,
    l.minimo,
    l.maximo,
    l.estadoDeFlota,
  ]);
  return aCsv(
    [
      'Código',
      'Nombre',
      'Municipalidad',
      'Estado',
      'Estaciones',
      'Longitud (km)',
      'Buses',
      'Mínimo',
      'Máximo',
      'Estado de la flota',
    ],
    filas,
  );
}

function csvDeBuses(
  red: RedCompleta,
  buses: readonly BusConParqueo[],
  f: FiltrosDeReporte,
): string {
  const filas = armarReporteDeBuses(red, buses, f).map((b) => [
    b.linea?.codigo ?? SIN_LINEA,
    b.placa,
    b.capacidadMax,
    b.estado,
    b.parqueo.codigo,
    b.parqueo.estacion.nombre,
  ]);
  return aCsv(['Línea', 'Placa', 'Capacidad', 'Estado', 'Parqueo', 'Estación del parqueo'], filas);
}

function csvDelReporte(
  tipo: TipoDeReporte,
  red: RedCompleta,
  buses: readonly BusConParqueo[],
  flota: readonly FlotaDeLineaResumen[],
  filtros: FiltrosDeReporte,
): string {
  switch (tipo) {
    case 'ESTACIONES':
      return csvDeEstaciones(red, buses, filtros);
    case 'LINEAS':
      return csvDeLineas(red, buses, flota, filtros);
    case 'BUSES':
      return csvDeBuses(red, buses, filtros);
  }
}

/** El archivo CSV con todas las filas del reporte, no solo una página. */
export function armarExportacion(
  tipo: TipoDeReporte,
  red: RedCompleta,
  buses: readonly BusConParqueo[],
  flota: readonly FlotaDeLineaResumen[],
  filtros: FiltrosDeReporte,
  fechaHora: Date,
): ArchivoExportado {
  return {
    nombreDeArchivo: nombreDeArchivo(tipo, fechaHora),
    contenido: csvDelReporte(tipo, red, buses, flota, filtros),
  };
}
