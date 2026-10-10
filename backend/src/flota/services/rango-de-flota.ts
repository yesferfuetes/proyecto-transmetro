import type { EstadoDeFlota } from '../../shared/contratos/flota';

export type { EstadoDeFlota };

export interface RangoDeFlota {
  minimo: number;
  maximo: number;
}

/** Con n estaciones, una línea admite entre n y 2n buses. */
export function rangoDeFlota(estaciones: number): RangoDeFlota {
  return { minimo: estaciones, maximo: estaciones * 2 };
}

export function estadoDeFlota(estaciones: number, buses: number): EstadoDeFlota {
  const { minimo, maximo } = rangoDeFlota(estaciones);
  if (buses < minimo) {
    return 'insuficiente';
  }
  return buses > maximo ? 'excedida' : 'completa';
}
