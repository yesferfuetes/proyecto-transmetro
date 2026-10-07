import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Lee los tokens de color de `globals.css` y calcula contrastes con la fórmula de WCAG 2. */
export const css = readFileSync(join(__dirname, '..', 'src', 'app', 'globals.css'), 'utf8');

export const coloresDeclarados = new Map(
  [...css.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-f]{6})/g)].map(([, nombre, valor]) => [
    nombre ?? '',
    valor ?? '',
  ]),
);

export function color(token: string): string {
  const valor = coloresDeclarados.get(token);
  if (!valor) {
    throw new Error(`El token --color-${token} no está declarado.`);
  }
  return valor;
}

function luminancia(hex: string): number {
  const canales = [1, 3, 5].map((inicio) => parseInt(hex.slice(inicio, inicio + 2), 16) / 255);
  const [r = 0, g = 0, b = 0] = canales.map((c) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contraste(primerToken: string, segundoToken: string): number {
  const [clara = 0, oscura = 0] = [
    luminancia(color(primerToken)),
    luminancia(color(segundoToken)),
  ].sort((a, b) => b - a);
  return (clara + 0.05) / (oscura + 0.05);
}
