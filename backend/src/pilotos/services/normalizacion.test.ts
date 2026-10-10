import {
  normalizarCorreo,
  normalizarDpi,
  normalizarTelefono,
  recortar,
  recortarONulo,
} from './normalizacion';

describe('normalizarDpi', () => {
  it.each(['1234567890101', '1234 56789 0101', ' 1234  56789   0101 ', '12345 6789 0101'])(
    'deja "%s" en la forma 1234 56789 0101',
    (texto) => {
      expect(normalizarDpi(texto)).toBe('1234 56789 0101');
    },
  );

  it.each(['123456789012', '12345678901234', '1234 56789 01a1', 'abcdefghijklm', ''])(
    'rechaza "%s"',
    (texto) => {
      expect(normalizarDpi(texto)).toBeNull();
    },
  );
});

describe('normalizarTelefono', () => {
  it.each(['55551234', '5555-1234', ' 5555-1234 '])('deja "%s" como 5555-1234', (texto) => {
    expect(normalizarTelefono(texto)).toBe('5555-1234');
  });

  it.each(['5555123', '555512345', '5555-123', '55 55 1234', 'abcd-efgh', ''])(
    'rechaza "%s"',
    (texto) => {
      expect(normalizarTelefono(texto)).toBeNull();
    },
  );
});

describe('normalizarCorreo', () => {
  it('recorta un correo válido', () => {
    expect(normalizarCorreo('  carlos@correo.com ')).toBe('carlos@correo.com');
  });

  it.each(['carlos.correo.com', 'carlos@', '@correo.com', 'carlos@correo', 'car los@correo.com'])(
    'rechaza "%s"',
    (texto) => {
      expect(normalizarCorreo(texto)).toBeNull();
    },
  );
});

describe('texto libre', () => {
  it('recorta los lados', () => {
    expect(recortar('  Ana  ')).toBe('Ana');
  });

  it.each([undefined, null, '', '   '])('trata %p como nulo', (texto) => {
    expect(recortarONulo(texto)).toBeNull();
  });

  it('conserva un texto con contenido', () => {
    expect(recortarONulo(' a ')).toBe('a');
  });
});
