import { describe, expect, it } from 'vitest';
import { esquemaFiltrosDeBitacora } from './bitacora';

describe('esquemaFiltrosDeBitacora', () => {
  it('toma los filtros válidos de la URL', () => {
    expect(
      esquemaFiltrosDeBitacora.parse({
        usuarioId: '4',
        tipo: 'LINEAS',
        desde: '2026-10-01',
        hasta: '2026-10-09',
        pagina: '3',
      }),
    ).toEqual({
      usuarioId: 4,
      tipo: 'LINEAS',
      desde: '2026-10-01',
      hasta: '2026-10-09',
      pagina: 3,
    });
  });

  it('ignora lo que no sirve', () => {
    expect(
      esquemaFiltrosDeBitacora.parse({
        usuarioId: 'abc',
        tipo: 'PILOTOS',
        desde: '01/10/2026',
        hasta: ['2026-10-01', '2026-10-02'],
        pagina: '-1',
      }),
    ).toEqual({
      usuarioId: undefined,
      tipo: undefined,
      desde: undefined,
      hasta: undefined,
      pagina: 1,
    });
  });
});
