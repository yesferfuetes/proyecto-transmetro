import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const SRC = join(__dirname, '..', 'src');

/** Archivos fuente de `src/` que cumplen la expresión, con ruta relativa a `src/`, sin pruebas. */
export function archivosFuente(extensiones: RegExp): string[] {
  return readdirSync(SRC, { recursive: true, encoding: 'utf8' })
    .filter((ruta) => extensiones.test(ruta) && !/\.test\.tsx?$/.test(ruta))
    .map((ruta) => relative(SRC, join(SRC, ruta)));
}

export function leer(ruta: string): string {
  return readFileSync(join(SRC, ruta), 'utf8');
}
