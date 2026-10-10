import { BUSES, RED } from './datos-de-prueba';
import { aplicarFiltros } from './filtrar-red';

function codigos(filtros: Parameters<typeof aplicarFiltros>[2]): {
  lineas: string[];
  estaciones: string[];
  buses: string[];
} {
  const resultado = aplicarFiltros(RED, BUSES, filtros);
  return {
    lineas: resultado.lineas.map((l) => l.codigo).sort(),
    estaciones: resultado.estaciones.map((e) => e.codigo).sort(),
    buses: resultado.buses.map((b) => b.placa).sort(),
  };
}

describe('aplicarFiltros', () => {
  it('sin filtros devuelve todo, incluidos los buses sin línea', () => {
    const resultado = codigos({});

    expect(resultado.lineas).toEqual(['L1', 'L10', 'L2']);
    expect(resultado.estaciones).toHaveLength(5);
    expect(resultado.buses).toEqual(['B-01', 'B-02', 'B-03', 'B-04', 'B-05']);
  });

  it('por línea: la línea, sus estaciones y sus buses, sin buses sin línea', () => {
    expect(codigos({ lineaId: 1 })).toEqual({
      lineas: ['L1'],
      estaciones: ['E1', 'E10', 'E2'],
      buses: ['B-01', 'B-02'],
    });
  });

  it('por estación: la estación, las líneas que pasan por ella y los buses de esas líneas', () => {
    expect(codigos({ estacionId: 2 })).toEqual({
      lineas: ['L1', 'L2'],
      estaciones: ['E2'],
      buses: ['B-01', 'B-02', 'B-03', 'B-05'],
    });
  });

  it('por municipalidad: sus líneas y estaciones, y los buses de esas líneas', () => {
    expect(codigos({ municipalidadId: 2 })).toEqual({
      lineas: ['L2'],
      estaciones: ['E3', 'E4'],
      buses: ['B-03', 'B-05'],
    });
  });

  it('combina los filtros con "y"', () => {
    expect(codigos({ lineaId: 1, municipalidadId: 1, estacionId: 1 })).toEqual({
      lineas: ['L1'],
      estaciones: ['E1'],
      buses: ['B-01', 'B-02'],
    });
  });

  it('una estación que no pasa por la línea filtrada deja todo vacío', () => {
    expect(codigos({ lineaId: 1, estacionId: 3 })).toEqual({
      lineas: [],
      estaciones: [],
      buses: [],
    });
  });

  it('una línea de otra municipalidad no deja líneas ni buses; las estaciones se filtran una a una', () => {
    expect(codigos({ lineaId: 2, municipalidadId: 1 })).toEqual({
      lineas: [],
      estaciones: ['E2'],
      buses: [],
    });
  });

  it('los buses sin línea solo salen cuando no hay ningún filtro', () => {
    expect(
      aplicarFiltros(RED, BUSES, { municipalidadId: 1 }).buses.map((b) => b.placa),
    ).not.toContain('B-04');
    expect(aplicarFiltros(RED, BUSES, {}).buses.map((b) => b.placa)).toContain('B-04');
  });
});
