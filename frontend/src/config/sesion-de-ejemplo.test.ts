import { describe, expect, it } from 'vitest';
import { leerRolDeEjemplo } from './sesion-de-ejemplo';

describe('leerRolDeEjemplo', () => {
  it('por defecto es supervisor', () => {
    expect(leerRolDeEjemplo({})).toBe('supervisor');
  });

  it('fuera de producción respeta ROL_DE_EJEMPLO', () => {
    expect(leerRolDeEjemplo({ NODE_ENV: 'development', ROL_DE_EJEMPLO: 'administrador' })).toBe(
      'administrador',
    );
  });

  it('en producción ignora ROL_DE_EJEMPLO', () => {
    expect(leerRolDeEjemplo({ NODE_ENV: 'production', ROL_DE_EJEMPLO: 'administrador' })).toBe(
      'supervisor',
    );
  });

  it('un valor inválido cae en supervisor', () => {
    expect(leerRolDeEjemplo({ ROL_DE_EJEMPLO: 'pasajero' })).toBe('supervisor');
  });
});
