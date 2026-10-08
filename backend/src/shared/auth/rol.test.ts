import { esRol, ROLES } from './rol';

describe('esRol', () => {
  it.each(ROLES)('acepta %s', (rol) => {
    expect(esRol(rol)).toBe(true);
  });

  it.each(['', 'operador', 'administrador', 'SUPERVISOR', 'GUARDIA'])('rechaza "%s"', (valor) => {
    expect(esRol(valor)).toBe(false);
  });
});
