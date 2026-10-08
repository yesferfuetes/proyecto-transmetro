import { leerContrasenaDeSiembra } from './contrasena';

describe('leerContrasenaDeSiembra', () => {
  it('devuelve una contraseña que cumple la política', () => {
    expect(leerContrasenaDeSiembra({ SEED_CONTRASENA: 'Demo2026x' })).toBe('Demo2026x');
  });

  it.each([undefined, ''])('falla con un mensaje claro si falta (%p)', (valor) => {
    expect(() => leerContrasenaDeSiembra({ SEED_CONTRASENA: valor })).toThrow(
      /Falta SEED_CONTRASENA/,
    );
  });

  it.each(['abc123', 'abcdefgh', '12345678'])(
    'rechaza "%s" por no cumplir la política',
    (valor) => {
      expect(() => leerContrasenaDeSiembra({ SEED_CONTRASENA: valor })).toThrow(/al menos 8/);
    },
  );
});
