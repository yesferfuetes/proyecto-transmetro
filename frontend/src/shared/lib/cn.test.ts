import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
  it('omite las clases condicionales falsas', () => {
    expect(cn('px-4', false && 'py-2', undefined, 'text-ink')).toBe('px-4 text-ink');
  });

  it('resuelve clases en conflicto a favor de la última', () => {
    expect(cn('text-ink', 'text-primary')).toBe('text-primary');
  });
});

describe('cn con los tokens propios', () => {
  it('conserva un tamaño de texto propio junto a un color', () => {
    expect(cn('text-line-number', 'text-ink')).toBe('text-line-number text-ink');
    expect(cn('text-label text-ink-inverse')).toBe('text-label text-ink-inverse');
  });

  it('resuelve dos tamaños de texto propios a favor del último', () => {
    expect(cn('text-dense', 'text-label')).toBe('text-label');
  });

  it('resuelve medidas y sombras propias en conflicto', () => {
    expect(cn('h-control', 'h-control-dense')).toBe('h-control-dense');
    expect(cn('shadow-sm', 'shadow-float')).toBe('shadow-float');
  });
});
