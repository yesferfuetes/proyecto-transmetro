import { inicioEnMinutos, normalizarTurno, turnosSeTraslapan } from './turnos';

describe('normalizarTurno', () => {
  it.each([
    ['06:00-14:00', '06:00-14:00'],
    ['6:00-14:00', '06:00-14:00'],
    [' 6:30 - 9:05 ', '06:30-09:05'],
    ['22:00-06:00', '22:00-06:00'],
    ['00:00-23:59', '00:00-23:59'],
  ])('acepta %p como %p', (texto, esperado) => {
    expect(normalizarTurno(texto)).toBe(esperado);
  });

  it.each(['25:00-06:00', '08:00-08:00', '6-14', '06:60-14:00', '24:00-06:00', '', 'mañana'])(
    'rechaza %p',
    (texto) => {
      expect(normalizarTurno(texto)).toBeNull();
    },
  );
});

describe('inicioEnMinutos', () => {
  it('cuenta los minutos desde la medianoche', () => {
    expect(inicioEnMinutos('06:30-14:00')).toBe(390);
    expect(inicioEnMinutos('22:00-06:00')).toBe(1320);
  });
});

describe('turnosSeTraslapan', () => {
  it.each([
    ['el mismo rango', '06:00-14:00', '06:00-14:00', true],
    ['un rango dentro de otro', '06:00-14:00', '08:00-10:00', true],
    ['rangos que se cruzan', '06:00-14:00', '10:00-18:00', true],
    ['rangos separados', '06:00-10:00', '12:00-18:00', false],
    ['rangos contiguos', '06:00-14:00', '14:00-22:00', false],
    ['rangos contiguos al revés', '14:00-22:00', '06:00-14:00', false],
    ['nocturno contra madrugada', '22:00-06:00', '05:00-08:00', true],
    ['nocturno contra noche', '22:00-06:00', '21:00-23:00', true],
    ['nocturno contra mediodía', '22:00-06:00', '08:00-18:00', false],
    ['nocturno que termina cuando el otro empieza', '22:00-06:00', '06:00-14:00', false],
    ['nocturno que empieza cuando el otro termina', '22:00-06:00', '14:00-22:00', false],
    ['dos nocturnos', '22:00-06:00', '23:00-02:00', true],
    ['dos nocturnos que solo comparten la medianoche', '20:00-00:00', '00:00-04:00', false],
    ['nocturno contra nocturno contiguo', '18:00-02:00', '02:00-10:00', false],
  ])('%s: %s y %s', (_caso, a, b, esperado) => {
    expect(turnosSeTraslapan(a, b)).toBe(esperado);
    expect(turnosSeTraslapan(b, a)).toBe(esperado);
  });

  it('no considera traslape un texto que no es turno', () => {
    expect(turnosSeTraslapan('mañana', '06:00-14:00')).toBe(false);
  });
});
