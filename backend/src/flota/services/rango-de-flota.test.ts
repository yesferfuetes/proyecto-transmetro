import { estadoDeFlota, rangoDeFlota } from './rango-de-flota';

describe('rango de flota', () => {
  it('con n estaciones admite entre n y 2n buses', () => {
    expect(rangoDeFlota(3)).toEqual({ minimo: 3, maximo: 6 });
  });

  it('una línea sin estaciones no admite ningún bus', () => {
    expect(rangoDeFlota(0)).toEqual({ minimo: 0, maximo: 0 });
  });

  it.each([
    [3, 2, 'insuficiente'],
    [3, 3, 'completa'],
    [3, 6, 'completa'],
    [3, 7, 'excedida'],
    [0, 0, 'completa'],
    [0, 1, 'excedida'],
  ] as const)('con %i estaciones y %i buses la flota está %s', (estaciones, buses, esperado) => {
    expect(estadoDeFlota(estaciones, buses)).toBe(esperado);
  });
});
