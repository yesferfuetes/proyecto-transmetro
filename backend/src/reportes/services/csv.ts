import type { TipoDeReporte } from './tipos-de-reporte';

const BOM = '﻿';
const SALTO = '\r\n';
const DESFASE_DE_GUATEMALA_MS = -6 * 60 * 60 * 1000;

export type Celda = string | number | null;

function escapar(celda: Celda): string {
  const texto = celda === null ? '' : String(celda);
  return /[",\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

/** CSV con BOM UTF-8, coma como separador, comillas cuando hacen falta y `\r\n` entre filas. */
export function aCsv(encabezados: readonly string[], filas: readonly (readonly Celda[])[]): string {
  const lineas = [encabezados, ...filas].map((fila) => fila.map(escapar).join(','));
  return BOM + lineas.join(SALTO) + SALTO;
}

function dos(numero: number): string {
  return String(numero).padStart(2, '0');
}

/** Fecha y hora de Guatemala (UTC−6, sin horario de verano) como `AAAAMMDD-HHmm`. */
export function sello(ahora: Date): string {
  const local = new Date(ahora.getTime() + DESFASE_DE_GUATEMALA_MS);
  const fecha = `${local.getUTCFullYear()}${dos(local.getUTCMonth() + 1)}${dos(local.getUTCDate())}`;
  return `${fecha}-${dos(local.getUTCHours())}${dos(local.getUTCMinutes())}`;
}

export function nombreDeArchivo(tipo: TipoDeReporte, ahora: Date): string {
  return `reporte-${tipo.toLowerCase()}-${sello(ahora)}.csv`;
}
