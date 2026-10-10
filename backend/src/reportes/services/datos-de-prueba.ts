import type { BusConParqueo, FlotaDeLineaResumen } from '../../shared/contratos/flota';
import type { EstacionResumen, LineaDeRed, RedCompleta } from '../../shared/contratos/red';

function estacion(
  id: number,
  codigo: string,
  municipalidadId: number,
  tieneParqueo: boolean,
): EstacionResumen {
  return { id, codigo, nombre: `Estación ${codigo}`, municipalidadId, tieneParqueo };
}

function linea(
  id: number,
  codigo: string,
  municipalidadId: number,
  estacionIds: number[],
  estado: LineaDeRed['estado'] = 'ACTIVA',
): LineaDeRed {
  return {
    id,
    codigo,
    nombre: `Línea ${codigo}`,
    estado,
    numeroDeEstaciones: estacionIds.length,
    municipalidadId,
    longitudKm: estacionIds.length > 1 ? estacionIds.length * 1.5 : null,
    estacionIds,
  };
}

function bus(
  id: number,
  placa: string,
  lineaId: number | null,
  estado: BusConParqueo['estado'] = 'ACTIVO',
): BusConParqueo {
  return {
    id,
    placa,
    capacidadMax: 100 + id,
    lineaId,
    estado,
    parqueo: { id: 1, codigo: 'P1', estacionId: 1 },
  };
}

/** Dos municipalidades; L2 y L1 comparten la estación 2; L10 va en construcción. Desordenada a propósito. */
export const RED: RedCompleta = {
  municipalidades: [
    { id: 2, nombre: 'Mixco' },
    { id: 1, nombre: 'Guatemala' },
  ],
  lineas: [
    linea(3, 'L10', 1, [5], 'EN_CONSTRUCCION'),
    linea(2, 'L2', 2, [3, 4, 2]),
    linea(1, 'L1', 1, [1, 2, 5]),
  ],
  estaciones: [
    estacion(5, 'E10', 1, false),
    estacion(3, 'E3', 2, true),
    estacion(1, 'E1', 1, true),
    estacion(4, 'E4', 2, false),
    estacion(2, 'E2', 1, false),
  ],
};

/** Cinco buses: dos en L1, dos en L2 y uno de baja sin línea. */
export const BUSES: BusConParqueo[] = [
  bus(1, 'B-02', 1),
  bus(2, 'B-01', 1),
  bus(3, 'B-03', 2),
  bus(4, 'B-04', null, 'BAJA'),
  bus(5, 'B-05', 2, 'MANTENIMIENTO'),
];

export const FLOTA: FlotaDeLineaResumen[] = [
  { lineaId: 1, buses: 2, minimo: 2, maximo: 6, estadoDeFlota: 'completa' },
  { lineaId: 2, buses: 2, minimo: 3, maximo: 9, estadoDeFlota: 'insuficiente' },
  { lineaId: 3, buses: 0, minimo: 0, maximo: 0, estadoDeFlota: 'completa' },
];
