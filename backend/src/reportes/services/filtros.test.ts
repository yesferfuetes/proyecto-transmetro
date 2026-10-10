import { leerFiltros, normalizarFiltros } from './filtros';

describe('normalizarFiltros', () => {
  it('sin filtros es null', () => {
    expect(normalizarFiltros({})).toBeNull();
    expect(normalizarFiltros({ lineaId: undefined })).toBeNull();
  });

  it('guarda solo los presentes, siempre en el mismo orden', () => {
    expect(normalizarFiltros({ municipalidadId: 3, lineaId: 1 })).toBe(
      '{"lineaId":1,"municipalidadId":3}',
    );
    expect(normalizarFiltros({ municipalidadId: 3, estacionId: 2, lineaId: 1 })).toBe(
      '{"lineaId":1,"estacionId":2,"municipalidadId":3}',
    );
  });
});

describe('leerFiltros', () => {
  it('recupera lo guardado', () => {
    expect(leerFiltros('{"lineaId":1,"estacionId":2}')).toEqual({ lineaId: 1, estacionId: 2 });
  });

  it.each([null, 'no es json', '[]', '"texto"', '{"lineaId":"1","estacionId":-2}'])(
    'ignora lo ilegible o inválido: %s',
    (json) => {
      expect(leerFiltros(json)).toEqual({});
    },
  );
});
