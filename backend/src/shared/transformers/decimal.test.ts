import { transformadorDecimal } from './decimal';

describe('transformadorDecimal', () => {
  it('convierte el texto de NUMERIC en número', () => {
    expect(transformadorDecimal.from('12.345')).toBe(12.345);
  });

  it('conserva null en ambos sentidos', () => {
    expect(transformadorDecimal.from(null)).toBeNull();
    expect(transformadorDecimal.to(null)).toBeNull();
  });

  it('entrega el número sin cambios hacia la base', () => {
    expect(transformadorDecimal.to(3.2)).toBe(3.2);
  });
});
