import { describe, expect, it } from 'vitest';
import { contraste } from './tokens-css';

/**
 * Verifica con la fórmula de WCAG 2 cada par texto/fondo que usan los componentes.
 * AA: 4.5:1 para texto normal; 3:1 para texto grande y para elementos no textuales.
 */
const TEXTO = 4.5;
const GRANDE_O_NO_TEXTUAL = 3;

const FONDOS_CLAROS = ['surface', 'canvas', 'primary-soft', 'neutral-50'];
const TEXTOS_SOBRE_CLARO = [
  'ink',
  'ink-muted',
  'primary',
  'primary-strong',
  'accent-strong',
  'danger',
  'danger-strong',
  'warning',
  'warning-strong',
  'success',
];

const FONDOS_OSCUROS = ['primary', 'night-mid', 'night-raised', 'night'];
const TEXTOS_SOBRE_OSCURO = [
  'ink-inverse',
  'accent',
  'ink-inverse-muted',
  'danger-on-night',
  'success-on-night',
  'neutral-400',
];

function pares(textos: string[], fondos: string[]): [string, string][] {
  return textos.flatMap((texto) => fondos.map((fondo): [string, string] => [texto, fondo]));
}

describe('contraste del texto', () => {
  it.each(pares(TEXTOS_SOBRE_CLARO, FONDOS_CLAROS))('%s sobre %s', (texto, fondo) => {
    expect(contraste(texto, fondo)).toBeGreaterThanOrEqual(TEXTO);
  });

  it.each(pares(TEXTOS_SOBRE_OSCURO, FONDOS_OSCUROS))('%s sobre %s', (texto, fondo) => {
    expect(contraste(texto, fondo)).toBeGreaterThanOrEqual(TEXTO);
  });

  it.each([
    ['warning-on-night', 'night-raised'],
    ['warning-on-night', 'night'],
    ['danger-strong', 'danger-soft'],
    ['warning-strong', 'warning-soft'],
    ['success-strong', 'success-soft'],
    ['ink', 'danger-soft'],
    ['ink', 'warning-soft'],
    ['ink', 'success-soft'],
    ['ink', 'accent'],
    ['ink', 'accent-light'],
    ['ink', 'accent-500'],
    ['night', 'accent'],
    ['ink-inverse', 'danger'],
    ['ink-inverse', 'success'],
    ['ink-inverse', 'warning-strong'],
    ['ink-inverse', 'neutral-600'],
  ])('%s sobre %s', (texto, fondo) => {
    expect(contraste(texto, fondo)).toBeGreaterThanOrEqual(TEXTO);
  });

  it('el acento no se usa como texto sobre claro', () => {
    expect(contraste('accent', 'surface')).toBeLessThan(TEXTO);
  });

  it('el borde fuerte no se usa como texto', () => {
    expect(contraste('border-strong', 'surface')).toBeLessThan(TEXTO);
  });
});

describe('contraste de elementos no textuales', () => {
  it.each([
    ['border-strong', 'surface'],
    ['border-strong', 'canvas'],
    ['primary', 'surface'],
    ['primary', 'canvas'],
    ['accent', 'night'],
    ['accent', 'night-raised'],
    ['warning', 'surface'],
    ['success-600', 'surface'],
    ['danger', 'surface'],
    ['warning-on-night', 'night'],
    ['success-on-night', 'night'],
    ['danger-on-night', 'night'],
    ['neutral-400', 'night'],
  ])('%s sobre %s alcanza 3:1', (elemento, fondo) => {
    expect(contraste(elemento, fondo)).toBeGreaterThanOrEqual(GRANDE_O_NO_TEXTUAL);
  });
});

describe('contraste de las insignias de línea', () => {
  const TEXTO_DE_LINEA: [string, string][] = [
    ['linea-1', 'ink-inverse'],
    ['linea-2', 'ink'],
    ['linea-6', 'ink'],
    ['linea-7', 'ink'],
    ['linea-12', 'ink'],
    ['linea-13', 'ink'],
    ['linea-18', 'ink'],
    ['linea-r5', 'ink-inverse'],
    ['neutral-600', 'ink-inverse'],
  ];

  it.each(TEXTO_DE_LINEA)('el número sobre %s alcanza 3:1 como texto grande', (linea, texto) => {
    expect(contraste(texto, linea)).toBeGreaterThanOrEqual(GRANDE_O_NO_TEXTUAL);
  });

  it.each(TEXTO_DE_LINEA.filter(([linea]) => linea !== 'linea-12'))(
    'el número sobre %s alcanza 4.5:1',
    (linea, texto) => {
      expect(contraste(texto, linea)).toBeGreaterThanOrEqual(TEXTO);
    },
  );
});
