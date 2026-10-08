/** PostgreSQL entrega conteos y NUMERIC como texto en las consultas sin entidad. */
export function aNumero(valor: string | number): number {
  return Number(valor);
}

export function aNumeroONulo(valor: string | number | null): number | null {
  return valor === null ? null : Number(valor);
}

/** Patrón de búsqueda parcial que trata `%`, `_` y `\` como texto. */
export function patronDeBusqueda(texto: string): string {
  return `%${texto.trim().replace(/[\\%_]/g, (caracter) => `\\${caracter}`)}%`;
}

/** Expresiones para ordenar códigos por prefijo y número: L2 antes que L10, y R5 después de L18. */
export function ordenNaturalDeCodigo(columna: string): string[] {
  return [`REGEXP_REPLACE(${columna}, '[0-9]', '', 'g')`, `LENGTH(${columna})`, columna];
}
