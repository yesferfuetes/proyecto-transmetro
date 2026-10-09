export type EstadoDeBus = 'ACTIVO' | 'MANTENIMIENTO' | 'BAJA';

export interface BusResumen {
  id: number;
  placa: string;
  capacidadMax: number;
  lineaId: number | null;
  estado: EstadoDeBus;
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
}
