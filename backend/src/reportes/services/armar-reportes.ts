import type { BusConParqueo, FlotaDeLineaResumen } from '../../shared/contratos/flota';
import type { LineaDeRed, RedCompleta } from '../../shared/contratos/red';
import { aplicarFiltros } from './filtrar-red';
import type {
  FilaDeBus,
  FilaDeEstacion,
  FilaDeLinea,
  FiltrosDeReporte,
  GrupoDeBuses,
  LineaBasica,
} from './tipos-de-reporte';

/** Orden natural: L2 antes que L10. */
export function compararTexto(a: string, b: string): number {
  return a.localeCompare(b, 'es', { numeric: true });
}

function lineaBasica(linea: LineaDeRed): LineaBasica {
  return { id: linea.id, codigo: linea.codigo, nombre: linea.nombre };
}

function nombresDeMunicipalidades(red: RedCompleta): Map<number, string> {
  return new Map(red.municipalidades.map((m) => [m.id, m.nombre]));
}

export function armarReporteDeEstaciones(
  red: RedCompleta,
  buses: readonly BusConParqueo[],
  filtros: FiltrosDeReporte,
): FilaDeEstacion[] {
  const municipalidades = nombresDeMunicipalidades(red);
  const lineasOrdenadas = [...red.lineas].sort((a, b) => compararTexto(a.codigo, b.codigo));
  return aplicarFiltros(red, buses, filtros)
    .estaciones.map((estacion) => ({
      id: estacion.id,
      codigo: estacion.codigo,
      nombre: estacion.nombre,
      municipalidad: {
        id: estacion.municipalidadId,
        nombre: municipalidades.get(estacion.municipalidadId) ?? '',
      },
      lineas: lineasOrdenadas
        .filter((linea) => linea.estacionIds.includes(estacion.id))
        .map(lineaBasica),
      tieneParqueo: estacion.tieneParqueo,
    }))
    .sort((a, b) => compararTexto(a.codigo, b.codigo));
}

function resumenDeLinea(
  linea: LineaDeRed,
  flota: ReadonlyMap<number, FlotaDeLineaResumen>,
  buses: readonly BusConParqueo[],
): Pick<FilaDeLinea, 'buses' | 'minimo' | 'maximo' | 'estadoDeFlota'> {
  const resumen = flota.get(linea.id);
  if (resumen) {
    const { buses: cantidad, minimo, maximo, estadoDeFlota } = resumen;
    return { buses: cantidad, minimo, maximo, estadoDeFlota };
  }
  const propios = buses.filter((bus) => bus.lineaId === linea.id).length;
  return { buses: propios, minimo: 0, maximo: 0, estadoDeFlota: 'insuficiente' };
}

export function armarReporteDeLineas(
  red: RedCompleta,
  buses: readonly BusConParqueo[],
  flota: readonly FlotaDeLineaResumen[],
  filtros: FiltrosDeReporte,
): FilaDeLinea[] {
  const municipalidades = nombresDeMunicipalidades(red);
  const resumenes = new Map(flota.map((f) => [f.lineaId, f]));
  return aplicarFiltros(red, buses, filtros)
    .lineas.map((linea) => ({
      ...lineaBasica(linea),
      municipalidad: {
        id: linea.municipalidadId,
        nombre: municipalidades.get(linea.municipalidadId) ?? '',
      },
      estado: linea.estado,
      estaciones: linea.numeroDeEstaciones,
      longitudKm: linea.longitudKm,
      ...resumenDeLinea(linea, resumenes, buses),
    }))
    .sort((a, b) => compararTexto(a.codigo, b.codigo));
}

function posicionDeLinea(fila: FilaDeBus): number {
  return fila.linea === null ? 1 : 0;
}

function compararBuses(a: FilaDeBus, b: FilaDeBus): number {
  return (
    posicionDeLinea(a) - posicionDeLinea(b) ||
    compararTexto(a.linea?.codigo ?? '', b.linea?.codigo ?? '') ||
    compararTexto(a.placa, b.placa)
  );
}

export function armarReporteDeBuses(
  red: RedCompleta,
  buses: readonly BusConParqueo[],
  filtros: FiltrosDeReporte,
): FilaDeBus[] {
  const lineas = new Map(red.lineas.map((linea) => [linea.id, lineaBasica(linea)]));
  const estaciones = new Map(red.estaciones.map((estacion) => [estacion.id, estacion.nombre]));
  return aplicarFiltros(red, buses, filtros)
    .buses.map((bus) => ({
      id: bus.id,
      placa: bus.placa,
      capacidadMax: bus.capacidadMax,
      estado: bus.estado,
      linea: bus.lineaId === null ? null : (lineas.get(bus.lineaId) ?? null),
      parqueo: {
        id: bus.parqueo.id,
        codigo: bus.parqueo.codigo,
        estacion: {
          id: bus.parqueo.estacionId,
          nombre: estaciones.get(bus.parqueo.estacionId) ?? '',
        },
      },
    }))
    .sort(compararBuses);
}

/** Cantidad de buses por línea, en el orden del reporte: los sin línea al final. */
export function agruparBuses(filas: readonly FilaDeBus[]): GrupoDeBuses[] {
  const grupos: GrupoDeBuses[] = [];
  for (const fila of filas) {
    const ultimo = grupos.at(-1);
    if (ultimo && (ultimo.linea?.id ?? null) === (fila.linea?.id ?? null)) {
      ultimo.buses += 1;
    } else {
      grupos.push({ linea: fila.linea, buses: 1 });
    }
  }
  return grupos;
}
