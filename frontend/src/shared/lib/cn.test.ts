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
