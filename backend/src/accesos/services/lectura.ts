/** Patrón de búsqueda parcial que trata `%`, `_` y `\` como texto. */
export function patronDeBusqueda(texto: string): string {
  return `%${texto.trim().replace(/[\\%_]/g, (caracter) => `\\${caracter}`)}%`;
}

/** Comparación por código con números en orden natural: E2 antes que E10. */
export function porCodigo(a: { codigo: string }, b: { codigo: string }): number {
  return a.codigo.localeCompare(b.codigo, 'es', { numeric: true });
}
