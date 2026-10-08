import { validarEntorno } from './entorno';

const URL_VALIDA = 'postgres://usuario:clave@localhost:5432/transmetro';
const SECRETO_VALIDO = 'x'.repeat(32);
const MINIMO = { DATABASE_URL: URL_VALIDA, JWT_SECRETO: SECRETO_VALIDO };

describe('validarEntorno', () => {
  it('aplica valores por defecto y convierte el puerto a número', () => {
    expect(validarEntorno({ ...MINIMO, PORT: '4000' })).toEqual({
      NODE_ENV: 'development',
      PORT: 4000,
      DATABASE_URL: URL_VALIDA,
      JWT_SECRETO: SECRETO_VALIDO,
    });
  });

  it('falla si falta DATABASE_URL e indica la variable', () => {
    expect(() => validarEntorno({ JWT_SECRETO: SECRETO_VALIDO })).toThrow(/DATABASE_URL/);
  });

  it('falla si DATABASE_URL no es una URL de PostgreSQL', () => {
    expect(() => validarEntorno({ ...MINIMO, DATABASE_URL: 'mysql://localhost/x' })).toThrow(
      /DATABASE_URL/,
    );
  });

  it('falla con un NODE_ENV desconocido', () => {
    expect(() => validarEntorno({ ...MINIMO, NODE_ENV: 'staging' })).toThrow(/NODE_ENV/);
  });

  it('falla si falta JWT_SECRETO', () => {
    expect(() => validarEntorno({ DATABASE_URL: URL_VALIDA })).toThrow(/JWT_SECRETO/);
  });

  it('falla si JWT_SECRETO tiene menos de 32 caracteres', () => {
    expect(() => validarEntorno({ ...MINIMO, JWT_SECRETO: 'x'.repeat(31) })).toThrow(
      /JWT_SECRETO: debe tener al menos 32 caracteres/,
    );
  });
});
