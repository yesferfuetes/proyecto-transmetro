/** Placa sin espacios a los lados y en mayúsculas (` tm-0001 ` → `TM-0001`). */
export function normalizarPlaca(placa: string): string {
  return placa.trim().toUpperCase();
}

/** Código de parqueo sin espacios a los lados y en mayúsculas. */
export function normalizarCodigo(codigo: string): string {
  return codigo.trim().toUpperCase();
}
