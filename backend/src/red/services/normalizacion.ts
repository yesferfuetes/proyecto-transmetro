/** Códigos de línea y estación: sin espacios a los lados y en mayúsculas (`l1` → `L1`). */
export function normalizarCodigo(codigo: string): string {
  return codigo.trim().toUpperCase();
}

/** Texto libre sin espacios a los lados. */
export function recortar(texto: string): string {
  return texto.trim();
}
