export type EstadoDeBus = 'ACTIVO' | 'MANTENIMIENTO' | 'BAJA';

export interface BusResumen {
  id: number;
  placa: string;
  capacidadMax: number;
  lineaId: number | null;
  estado: EstadoDeBus;
}

export type EstadoDeFlota = 'completa' | 'insuficiente' | 'excedida';

export interface BusConParqueo extends BusResumen {
  parqueo: { id: number; codigo: string; estacionId: number };
}

export interface FlotaDeLineaResumen {
  lineaId: number;
  buses: number;
  minimo: number;
  maximo: number;
  estadoDeFlota: EstadoDeFlota;
}

/**
 * Lo que los demás módulos pueden consultar de la flota. La implementa el módulo de flota y la
 * exporta como proveedor global; los demás la usan desde un adapter propio.
 */
export abstract class ConsultasDeFlota {
  abstract estacionTieneParqueos(estacionId: number): Promise<boolean>;
  abstract obtenerBus(id: number): Promise<BusResumen | null>;
  abstract obtenerBuses(ids: readonly number[]): Promise<BusResumen[]>;
  abstract busesDeLinea(lineaId: number): Promise<BusResumen[]>;
  /** Todos los buses con su parqueo, ordenados por placa. */
  abstract listarBuses(): Promise<BusConParqueo[]>;
  /** Una fila por línea. */
  abstract resumenDeFlotaPorLinea(): Promise<FlotaDeLineaResumen[]>;
}
