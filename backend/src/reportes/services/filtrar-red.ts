import type { BusConParqueo } from '../../shared/contratos/flota';
import type { EstacionResumen, LineaDeRed, RedCompleta } from '../../shared/contratos/red';
import type { FiltrosDeReporte } from './tipos-de-reporte';

export interface RedFiltrada {
  lineas: LineaDeRed[];
  estaciones: EstacionResumen[];
  buses: BusConParqueo[];
}

export function sinFiltros(filtros: FiltrosDeReporte): boolean {
  return (
    filtros.lineaId === undefined &&
    filtros.estacionId === undefined &&
    filtros.municipalidadId === undefined
  );
}

function lineaCumple(linea: LineaDeRed, filtros: FiltrosDeReporte): boolean {
  return (
    (filtros.lineaId === undefined || linea.id === filtros.lineaId) &&
    (filtros.estacionId === undefined || linea.estacionIds.includes(filtros.estacionId)) &&
    (filtros.municipalidadId === undefined || linea.municipalidadId === filtros.municipalidadId)
  );
}

function estacionCumple(
  estacion: EstacionResumen,
  filtros: FiltrosDeReporte,
  lineas: readonly LineaDeRed[],
): boolean {
  return (
    (filtros.estacionId === undefined || estacion.id === filtros.estacionId) &&
    (filtros.municipalidadId === undefined ||
      estacion.municipalidadId === filtros.municipalidadId) &&
    (filtros.lineaId === undefined ||
      lineas.some(
        (linea) => linea.id === filtros.lineaId && linea.estacionIds.includes(estacion.id),
      ))
  );
}

/**
 * Líneas, estaciones y buses que cumplen todos los filtros a la vez. Los buses son los de las
 * líneas candidatas; los buses sin línea solo entran cuando no hay ningún filtro.
 */
export function aplicarFiltros(
  red: RedCompleta,
  buses: readonly BusConParqueo[],
  filtros: FiltrosDeReporte,
): RedFiltrada {
  const lineas = red.lineas.filter((linea) => lineaCumple(linea, filtros));
  const estaciones = red.estaciones.filter((estacion) =>
    estacionCumple(estacion, filtros, red.lineas),
  );
  const idsDeLineas = new Set(lineas.map((linea) => linea.id));
  const todas = sinFiltros(filtros);
  const candidatos = buses.filter((bus) =>
    bus.lineaId === null ? todas : idsDeLineas.has(bus.lineaId),
  );
  return { lineas, estaciones, buses: candidatos };
}
