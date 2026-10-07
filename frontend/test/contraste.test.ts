import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/** Verifica con la fórmula de WCAG 2 que cada par texto/fondo de la paleta alcanza AA (4.5:1). */
const css = readFileSync(join(__dirname, '..', 'src', 'app', 'globals.css'), 'utf8');
const tokens = new Map(
  [...css.matchAll(/--color-([a-z-]+):\s*(#[0-9a-f]{6})/g)].map(([, nombre, valor]) => [
    nombre ?? '',
    valor ?? '',
  ]),
);

function luminancia(hex: string): number {
  const canales = [1, 3, 5].map((inicio) => parseInt(hex.slice(inicio, inicio + 2), 16) / 255);
  const [r = 0, g = 0, b = 0] = canales.map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contraste(texto: string, fondo: string): number {
  const [clara, oscura] = [luminancia(color(texto)), luminancia(color(fondo))].sort(
    (a, b) => b - a,
  );
  return ((clara ?? 0) + 0.05) / ((oscura ?? 0) + 0.05);
}

function color(token: string): string {
  const valor = tokens.get(token);
  if (!valor) {
    throw new Error(`El token --color-${token} no está declarado.`);
  }
  return valor;
}

const TEXTOS_SOBRE_CLARO = [
  'primary',
  'primary-strong',
  'accent-strong',
  'danger',
  'success',
  'warning',
  'ink',
  'ink-muted',
];

describe('contraste de la paleta', () => {
  it.each(
    TEXTOS_SOBRE_CLARO.flatMap((texto) => [
      [texto, 'surface'],
      [texto, 'canvas'],
    ]),
  )('%s sobre %s alcanza 4.5:1', (texto, fondo) => {
    expect(contraste(texto ?? '', fondo ?? '')).toBeGreaterThanOrEqual(4.5);
  });

  it.each([
    ['surface', 'primary'],
    ['surface', 'primary-strong'],
    ['ink', 'accent'],
  ])('%s sobre %s alcanza 4.5:1', (texto, fondo) => {
    expect(contraste(texto, fondo)).toBeGreaterThanOrEqual(4.5);
  });

  it('el acento no se usa como texto sobre claro: no alcanza 4.5:1', () => {
    expect(contraste('accent', 'surface')).toBeLessThan(4.5);
  });
});
