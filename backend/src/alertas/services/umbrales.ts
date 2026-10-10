/** Porcentaje desde el que una demanda pide otra unidad. */
export const UMBRAL_DE_SOBRECUPO = 150;
/** Porcentaje bajo el cual un bus circula con baja ocupación. */
export const UMBRAL_DE_BAJA_OCUPACION = 25;
/** Porcentaje máximo que admite el registro. */
export const TOPE_DE_PORCENTAJE = 999;

/** Comparan con enteros, sin redondear: 24.99 % no es 25 % y 149.99 % no es 150 %. */
export function esSobrecupo(pasajeros: number, capacidad: number): boolean {
  return pasajeros * 100 >= capacidad * UMBRAL_DE_SOBRECUPO;
}

export function esBajaOcupacion(pasajeros: number, capacidad: number): boolean {
  return pasajeros * 100 < capacidad * UMBRAL_DE_BAJA_OCUPACION;
}

export function superaElTope(pasajeros: number, capacidad: number): boolean {
  return pasajeros * 100 > capacidad * TOPE_DE_PORCENTAJE;
}

/** Pasajeros entre capacidad por cien, con dos decimales. */
export function porcentaje(pasajeros: number, capacidad: number): number {
  return Math.round((pasajeros * 10000) / capacidad) / 100;
}
