import { validarEntorno } from './entorno';

const URL_VALIDA = 'postgres://usuario:clave@localhost:5432/transmetro';

describe('validarEntorno', () => {
  it('aplica valores por defecto y convierte el puerto a número', () => {
    expect(validarEntorno({ DATABASE_URL: URL_VALIDA, PORT: '4000' })).toEqual({
      NODE_ENV: 'development',
      PORT: 4000,
      DATABASE_URL: URL_VALIDA,
    });
  });

  it('falla si falta DATABASE_URL e indica la variable', () => {
    expect(() => validarEntorno({})).toThrow(/DATABASE_URL/);
  });

  it('falla si DATABASE_URL no es una URL de PostgreSQL', () => {
    expect(() => validarEntorno({ DATABASE_URL: 'mysql://localhost/x' })).toThrow(/DATABASE_URL/);
  });

  it('falla con un NODE_ENV desconocido', () => {
    expect(() => validarEntorno({ DATABASE_URL: URL_VALIDA, NODE_ENV: 'staging' })).toThrow(
      /NODE_ENV/,
    );
  });
});
