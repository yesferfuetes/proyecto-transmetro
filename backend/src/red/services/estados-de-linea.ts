import type { EstadoDeLinea } from '../../shared/contratos/red';

export const ESTADOS_DE_LINEA: readonly EstadoDeLinea[] = ['ACTIVA', 'INACTIVA', 'EN_CONSTRUCCION'];

export function esEstadoDeLinea(valor: string): valor is EstadoDeLinea {
  return (ESTADOS_DE_LINEA as readonly string[]).includes(valor);
}

/** Con una sola estación no hay recorrido ni distancia. */
export const MINIMO_DE_ESTACIONES_DE_LINEA_ACTIVA = 2;

/** Estado leído de la base. La aplicación solo guarda los tres valores válidos. */
export function leerEstadoDeLinea(valor: string): EstadoDeLinea {
  if (!esEstadoDeLinea(valor)) {
    throw new Error(`Estado de línea desconocido en la base: ${valor}`);
  }
  return valor;
}
