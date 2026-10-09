import type { IEvent } from '@nestjs/cqrs';

export type EstadoDeLinea = 'ACTIVA' | 'INACTIVA' | 'EN_CONSTRUCCION';

export interface EstacionResumen {
  id: number;
  codigo: string;
  nombre: string;
  municipalidadId: number;
  tieneParqueo: boolean;
}

export interface LineaResumen {
  id: number;
  codigo: string;
  nombre: string;
  estado: EstadoDeLinea;
  numeroDeEstaciones: number;
}

/**
 * Lo que los demás módulos pueden consultar de la red. La implementa el módulo de la red y la
 * exporta como proveedor global; los demás la usan desde un adapter propio.
 */
export abstract class ConsultasDeRed {
  abstract obtenerEstacion(id: number): Promise<EstacionResumen | null>;
  abstract obtenerEstaciones(ids: readonly number[]): Promise<EstacionResumen[]>;
  abstract listarEstaciones(): Promise<EstacionResumen[]>;
  abstract obtenerLinea(id: number): Promise<LineaResumen | null>;
  abstract obtenerLineas(ids: readonly number[]): Promise<LineaResumen[]>;
  /** Todas las líneas, ordenadas por código. */
  abstract listarLineas(): Promise<LineaResumen[]>;
  /** Estaciones de la línea en el orden de su recorrido. */
  abstract estacionesDeLinea(lineaId: number): Promise<EstacionResumen[]>;
}

/** Cambió el número de estaciones del recorrido de una línea. */
export class NumeroDeEstacionesDeLineaCambiado implements IEvent {
  constructor(
    readonly lineaId: number,
    readonly anterior: number,
    readonly nuevo: number,
  ) {}
}
