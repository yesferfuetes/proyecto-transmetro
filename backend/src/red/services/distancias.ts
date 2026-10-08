/** Las distancias se operan en metros enteros para que la suma no arrastre errores de redondeo. */
export const METROS_POR_KM = 1000;

export function kmAMetros(km: number): number {
  return Math.round(km * METROS_POR_KM);
}

export function metrosAKm(metros: number): number {
  return metros / METROS_POR_KM;
}
