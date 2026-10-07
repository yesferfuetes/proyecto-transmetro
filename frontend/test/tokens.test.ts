import { describe, expect, it } from 'vitest';
import { color, css } from './tokens-css';

describe('tokens de diseño', () => {
  it.each(['color', 'text', 'radius', 'shadow'])(
    'reinicia la familia --%s-* de Tailwind',
    (familia) => {
      expect(css).toContain(`--${familia}-*: initial;`);
    },
  );

  it.each([
    ['primary', '#10069f'],
    ['primary-700', '#10069f'],
    ['primary-800', '#000b8c'],
    ['night-mid', '#000b8c'],
    ['accent', '#96d600'],
    ['accent-400', '#96d600'],
    ['ink', '#231f20'],
    ['linea-1', '#5f4190'],
    ['linea-2', '#9e84bd'],
    ['linea-6', '#fed600'],
    ['linea-7', '#b0b0af'],
    ['linea-12', '#e85225'],
    ['linea-13', '#76bd22'],
    ['linea-18', '#1f9dd8'],
    ['linea-r5', '#000b8c'],
  ])('conserva el color institucional %s = %s', (token, valor) => {
    expect(color(token)).toBe(valor);
  });
});
