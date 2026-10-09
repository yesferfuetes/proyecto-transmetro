import type { EstadoDeBus } from '../../shared/contratos/flota';

export const ESTADOS_DE_BUS: readonly EstadoDeBus[] = ['ACTIVO', 'MANTENIMIENTO', 'BAJA'];

export function esEstadoDeBus(valor: string): valor is EstadoDeBus {
  return (ESTADOS_DE_BUS as readonly string[]).includes(valor);
}

/** Estado leído de la base. La aplicación solo guarda los tres valores válidos. */
export function leerEstadoDeBus(valor: string): EstadoDeBus {
  if (!esEstadoDeBus(valor)) {
    throw new Error(`Estado de bus desconocido en la base: ${valor}`);
  }
  return valor;
}
