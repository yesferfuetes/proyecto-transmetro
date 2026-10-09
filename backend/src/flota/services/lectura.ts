/** PostgreSQL entrega los conteos como texto en las consultas sin entidad. */
export function aNumero(valor: string | number): number {
  return Number(valor);
}

/** Patrón de búsqueda parcial que trata `%`, `_` y `\` como texto. */
export function patronDeBusqueda(texto: string): string {
  return `%${texto.trim().replace(/[\\%_]/g, (caracter) => `\\${caracter}`)}%`;
}

/** Orden natural de códigos: L2 antes que L10. */
export function compararCodigos(a: string, b: string): number {
  return a.localeCompare(b, 'es', { numeric: true });
}
