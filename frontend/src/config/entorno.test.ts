import { describe, expect, it } from 'vitest';
import { leerEntorno } from './entorno';

describe('leerEntorno', () => {
  it('acepta una URL HTTP del backend', () => {
    expect(leerEntorno({ BACKEND_URL: 'http://backend.railway.internal:3001' })).toEqual({
      BACKEND_URL: 'http://backend.railway.internal:3001',
    });
  });

  it('falla si falta BACKEND_URL e indica la variable', () => {
    expect(() => leerEntorno({})).toThrow(/BACKEND_URL/);
  });

  it('falla si BACKEND_URL no es una URL HTTP', () => {
    expect(() => leerEntorno({ BACKEND_URL: 'ftp://servidor' })).toThrow(/BACKEND_URL/);
  });
});
