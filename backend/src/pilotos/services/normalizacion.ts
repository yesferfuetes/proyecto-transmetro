/** Texto libre sin espacios a los lados. */
export function recortar(texto: string): string {
  return texto.trim();
}

/** Texto opcional: vacío o ausente es `null`. */
export function recortarONulo(texto: string | null | undefined): string | null {
  const recortado = texto?.trim() ?? '';
  return recortado === '' ? null : recortado;
}

/** `1234567890101` o `1234 56789 0101` → `1234 56789 0101`. Devuelve `null` si no tiene 13 dígitos. */
export function normalizarDpi(texto: string): string | null {
  const digitos = texto.replace(/\s/g, '');
  return /^\d{13}$/.test(digitos)
    ? `${digitos.slice(0, 4)} ${digitos.slice(4, 9)} ${digitos.slice(9)}`
    : null;
}

/** `55551234` o `5555-1234` → `5555-1234`. Devuelve `null` si no tiene 8 dígitos. */
export function normalizarTelefono(texto: string): string | null {
  const partes = /^(\d{4})-?(\d{4})$/.exec(texto.trim());
  return partes ? `${partes[1]}-${partes[2]}` : null;
}

/** Correo recortado. Devuelve `null` si no tiene forma de correo. */
export function normalizarCorreo(texto: string): string | null {
  const correo = texto.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) ? correo : null;
}
