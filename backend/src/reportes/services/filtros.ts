import type { FiltrosDeReporte } from './tipos-de-reporte';

function esIdPositivo(valor: unknown): valor is number {
  return typeof valor === 'number' && Number.isInteger(valor) && valor > 0;
}

/** JSON canónico de los filtros: solo los presentes, siempre en el mismo orden; null si no hay. */
export function normalizarFiltros(filtros: FiltrosDeReporte): string | null {
  const presentes: FiltrosDeReporte = {};
  if (filtros.lineaId !== undefined) {
    presentes.lineaId = filtros.lineaId;
  }
  if (filtros.estacionId !== undefined) {
    presentes.estacionId = filtros.estacionId;
  }
  if (filtros.municipalidadId !== undefined) {
    presentes.municipalidadId = filtros.municipalidadId;
  }
  return Object.keys(presentes).length === 0 ? null : JSON.stringify(presentes);
}

/** Filtros guardados en una constancia. Un contenido ilegible equivale a no tener filtros. */
export function leerFiltros(json: string | null): FiltrosDeReporte {
  if (json === null) {
    return {};
  }
  let crudo: unknown;
  try {
    crudo = JSON.parse(json);
  } catch {
    return {};
  }
  if (typeof crudo !== 'object' || crudo === null) {
    return {};
  }
  const { lineaId, estacionId, municipalidadId } = crudo as Record<string, unknown>;
  const filtros: FiltrosDeReporte = {};
  if (esIdPositivo(lineaId)) {
    filtros.lineaId = lineaId;
  }
  if (esIdPositivo(estacionId)) {
    filtros.estacionId = estacionId;
  }
  if (esIdPositivo(municipalidadId)) {
    filtros.municipalidadId = municipalidadId;
  }
  return filtros;
}
