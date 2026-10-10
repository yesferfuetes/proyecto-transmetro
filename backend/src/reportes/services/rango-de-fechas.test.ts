import { leerRango } from './rango-de-fechas';

describe('leerRango', () => {
  it('sin extremos no limita', () => {
    expect(leerRango()).toEqual({ desde: null, hasta: null });
  });

  it('solo el inicio: desde la medianoche de Guatemala (06:00 UTC)', () => {
    expect(leerRango('2026-10-08')).toEqual({
      desde: new Date('2026-10-08T06:00:00Z'),
      hasta: null,
    });
  });

  it('solo el fin: hasta el inicio del día siguiente, exclusivo', () => {
    expect(leerRango(undefined, '2026-10-08')).toEqual({
      desde: null,
      hasta: new Date('2026-10-09T06:00:00Z'),
    });
  });

  it('el mismo día de inicio y fin es válido y cubre el día completo', () => {
    const { desde, hasta } = leerRango('2026-10-08', '2026-10-08');

    expect(hasta?.getTime() ?? 0).toBeGreaterThan(desde?.getTime() ?? 0);
    expect((hasta?.getTime() ?? 0) - (desde?.getTime() ?? 0)).toBe(24 * 60 * 60 * 1000);
  });

  it('un cadena vacía cuenta como extremo ausente', () => {
    expect(leerRango('', '')).toEqual({ desde: null, hasta: null });
  });

  it('rechaza el inicio posterior al fin', () => {
    expect(() => leerRango('2026-10-09', '2026-10-08')).toThrow(
      expect.objectContaining({ codigo: 'RANGO_DE_FECHAS_INVALIDO' }) as Error,
    );
  });

  it.each(['2026-13-01', '2026-02-30', '08/10/2026', 'ayer', '2026-1-1'])(
    'rechaza la fecha mal formada %s',
    (fecha) => {
      expect(() => leerRango(fecha, undefined)).toThrow(
        expect.objectContaining({ codigo: 'RANGO_DE_FECHAS_INVALIDO' }) as Error,
      );
      expect(() => leerRango(undefined, fecha)).toThrow(
        expect.objectContaining({ codigo: 'RANGO_DE_FECHAS_INVALIDO' }) as Error,
      );
    },
  );
});
