import {
  esBajaOcupacion,
  esSobrecupo,
  porcentaje,
  superaElTope,
  TOPE_DE_PORCENTAJE,
} from './umbrales';

describe('umbrales con capacidad 100', () => {
  it.each([
    [149, false],
    [150, true],
    [400, true],
  ])('%i esperando: sobrecupo = %s', (pasajeros, esperado) => {
    expect(esSobrecupo(pasajeros, 100)).toBe(esperado);
  });

  it.each([
    [0, true],
    [24, true],
    [25, false],
    [26, false],
  ])('%i a bordo: baja ocupación = %s', (pasajeros, esperado) => {
    expect(esBajaOcupacion(pasajeros, 100)).toBe(esperado);
  });

  it.each([
    [999, false],
    [1000, true],
  ])('%i pasajeros: supera el tope = %s', (pasajeros, esperado) => {
    expect(superaElTope(pasajeros, 100)).toBe(esperado);
  });
});

describe('umbrales con una capacidad que no divide en partes iguales', () => {
  it('con capacidad 3, 4 pasajeros son 133.33 % y 5 son 166.67 %: el límite de 150 % cae en 4.5', () => {
    expect(esSobrecupo(4, 3)).toBe(false);
    expect(esSobrecupo(5, 3)).toBe(true);
  });

  it('con capacidad 3, el límite de 25 % cae en 0.75: 0 es baja ocupación y 1 no', () => {
    expect(esBajaOcupacion(0, 3)).toBe(true);
    expect(esBajaOcupacion(1, 3)).toBe(false);
  });

  it('con capacidad 7, 11 pasajeros (157.14 %) son sobrecupo y 10 (142.86 %) no', () => {
    expect(esSobrecupo(11, 7)).toBe(true);
    expect(esSobrecupo(10, 7)).toBe(false);
  });

  it('con capacidad 7, 1 pasajero (14.29 %) es baja ocupación y 2 (28.57 %) no', () => {
    expect(esBajaOcupacion(1, 7)).toBe(true);
    expect(esBajaOcupacion(2, 7)).toBe(false);
  });

  it('con capacidad 300, 74 pasajeros (24.67 %) son baja ocupación y 75 (25 %) no', () => {
    expect(esBajaOcupacion(74, 300)).toBe(true);
    expect(esBajaOcupacion(75, 300)).toBe(false);
  });

  it('con capacidad 3, el tope de 999 % cae en 29.97: 29 pasa y 30 lo supera', () => {
    expect(superaElTope(29, 3)).toBe(false);
    expect(superaElTope(30, 3)).toBe(true);
  });

  it('con capacidad 300, 2997 pasajeros son exactamente 999 % y 2998 lo superan', () => {
    expect(superaElTope(2997, 300)).toBe(false);
    expect(superaElTope(2998, 300)).toBe(true);
  });

  it('el tope es 999', () => {
    expect(TOPE_DE_PORCENTAJE).toBe(999);
  });
});

describe('porcentaje', () => {
  it.each([
    [150, 100, 150],
    [24, 100, 24],
    [0, 100, 0],
    [400, 100, 400],
    [4, 3, 133.33],
    [5, 3, 166.67],
    [1, 7, 14.29],
    [2997, 300, 999],
  ])('%i de %i es %f %%', (pasajeros, capacidad, esperado) => {
    expect(porcentaje(pasajeros, capacidad)).toBe(esperado);
  });
});
