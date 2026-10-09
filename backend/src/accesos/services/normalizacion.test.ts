import {
  normalizarCodigo,
  normalizarDpi,
  normalizarTelefono,
  recortarONulo,
} from './normalizacion';

describe('normalizarCodigo', () => {
  it('quita espacios a los lados y pasa a mayúsculas', () => {
    expect(normalizarCodigo(' a ')).toBe('A');
    expect(normalizarCodigo('n1')).toBe('N1');
  });
});

describe('normalizarDpi', () => {
  it('da la misma forma con y sin espacios', () => {
    expect(normalizarDpi('1234567890101')).toBe('1234 56789 0101');
    expect(normalizarDpi('1234 56789 0101')).toBe('1234 56789 0101');
  });

  it.each(['123456789010', '12345678901012', '1234 56789 010a', ''])('rechaza %p', (texto) => {
    expect(normalizarDpi(texto)).toBeNull();
  });
});

describe('normalizarTelefono', () => {
  it('da la misma forma con y sin guion', () => {
    expect(normalizarTelefono('55551234')).toBe('5555-1234');
    expect(normalizarTelefono(' 5555-1234 ')).toBe('5555-1234');
  });

  it.each(['5555-555', '555512345', '5555-12a4', '55-551234'])('rechaza %p', (texto) => {
    expect(normalizarTelefono(texto)).toBeNull();
  });
});

describe('recortarONulo', () => {
  it('trata lo vacío o ausente como nulo', () => {
    expect(recortarONulo('  ')).toBeNull();
    expect(recortarONulo(undefined)).toBeNull();
    expect(recortarONulo(' Principal ')).toBe('Principal');
  });
});
