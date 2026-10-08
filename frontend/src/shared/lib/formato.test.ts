import { describe, expect, it } from 'vitest';
import { formatearFechaHora, formatearKm } from './formato';

describe('formatearFechaHora', () => {
  it('muestra la hora de Guatemala aunque la fecha llegue en UTC', () => {
    expect(formatearFechaHora('2026-10-07T20:05:00Z')).toMatch(/07\/10\/2026.*14:05/);
  });

  it('acepta un Date', () => {
    expect(formatearFechaHora(new Date('2026-01-02T06:00:00Z'))).toMatch(/02\/01\/2026.*00:00/);
  });
});

describe('formatearKm', () => {
  it('usa tres decimales', () => {
    expect(formatearKm(2)).toBe('2.000 km');
    expect(formatearKm(1.2)).toBe('1.200 km');
    expect(formatearKm(12.3456)).toBe('12.346 km');
  });

  it('sin dato muestra una raya', () => {
    expect(formatearKm(null)).toBe('—');
  });
});
