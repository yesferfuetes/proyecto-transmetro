/** Patrón de búsqueda parcial que trata `%`, `_` y `\` como texto. */
export function patronDeBusqueda(texto: string): string {
  return `%${texto.trim().replace(/[\\%_]/g, (caracter) => `\\${caracter}`)}%`;
}

/** Minúsculas y vocales sin tilde, para comparar sin distinguir mayúsculas ni tildes. */
export function sinTildes(expresion: string): string {
  return `translate(lower(${expresion}), 'áéíóúü', 'aeiouu')`;
}

/** Comparación por código con números en orden natural: L2 antes que L10. */
export function porCodigo(a: { codigo: string }, b: { codigo: string }): number {
  return a.codigo.localeCompare(b.codigo, 'es', { numeric: true });
}
