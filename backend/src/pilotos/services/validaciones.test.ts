import { DatosDePiloto, validarExpediente } from './validaciones';

const VALIDOS: DatosDePiloto = {
  nombre: 'Carlos Pérez',
  dpi: '1234567890101',
  direccionResidencia: 'Zona 1',
  telefono: '55551234',
  correo: null,
  historialEducativo: 'Diversificado',
};

function codigoDe(datos: Partial<DatosDePiloto>): string | undefined {
  try {
    validarExpediente({ ...VALIDOS, ...datos });
    return undefined;
  } catch (error) {
    return (error as { codigo: string }).codigo;
  }
}

describe('validarExpediente', () => {
  it('normaliza todos los campos', () => {
    expect(
      validarExpediente({
        nombre: '  Carlos Pérez ',
        dpi: '1234 56789 0101',
        direccionResidencia: ' Zona 1 ',
        telefono: '5555-1234',
        correo: ' c@correo.com ',
        historialEducativo: ' Diversificado ',
      }),
    ).toEqual({
      nombre: 'Carlos Pérez',
      dpi: '1234 56789 0101',
      direccionResidencia: 'Zona 1',
      telefono: '5555-1234',
      correo: 'c@correo.com',
      historialEducativo: 'Diversificado',
    });
  });

  it('el correo vacío queda en null', () => {
    expect(validarExpediente({ ...VALIDOS, correo: '   ' }).correo).toBeNull();
  });

  it.each(['', '   ', 'x'.repeat(151)])('rechaza el nombre "%s" con NOMBRE_INVALIDO', (nombre) => {
    expect(codigoDe({ nombre })).toBe('NOMBRE_INVALIDO');
  });

  it('acepta un nombre de 150 caracteres', () => {
    expect(codigoDe({ nombre: 'x'.repeat(150) })).toBeUndefined();
  });

  it.each(['', '123456789012', '12345678901234', '123456789012a'])(
    'rechaza el DPI "%s" con DPI_INVALIDO',
    (dpi) => {
      expect(codigoDe({ dpi })).toBe('DPI_INVALIDO');
    },
  );

  it.each(['', '   '])('exige la dirección ("%s")', (direccionResidencia) => {
    expect(codigoDe({ direccionResidencia })).toBe('DATOS_DE_RESIDENCIA_REQUERIDOS');
  });

  it.each(['', '   '])('exige el historial ("%s")', (historialEducativo) => {
    expect(codigoDe({ historialEducativo })).toBe('HISTORIAL_EDUCATIVO_REQUERIDO');
  });

  it.each(['', '   '])('exige el teléfono ("%s")', (telefono) => {
    expect(codigoDe({ telefono })).toBe('DATOS_DE_COMUNICACION_REQUERIDOS');
  });

  it('rechaza un teléfono de 7 dígitos', () => {
    expect(codigoDe({ telefono: '5555123' })).toBe('TELEFONO_INVALIDO');
  });

  it('rechaza un correo sin arroba', () => {
    expect(codigoDe({ correo: 'carlos.correo.com' })).toBe('CORREO_INVALIDO');
  });

  it('lanza primero el nombre, luego el DPI, la dirección, el historial, el teléfono y el correo', () => {
    const todoMal: DatosDePiloto = {
      nombre: '',
      dpi: '1',
      direccionResidencia: '',
      telefono: '',
      correo: 'x',
      historialEducativo: '',
    };
    const orden: Partial<DatosDePiloto>[] = [
      {},
      { nombre: 'Ana' },
      { dpi: VALIDOS.dpi },
      { direccionResidencia: 'Zona 1' },
      { historialEducativo: 'Básico' },
      { telefono: '5555-1234' },
    ];
    const acumulado: Partial<DatosDePiloto> = {};
    const codigos = orden.map((corregido) => {
      Object.assign(acumulado, corregido);
      return codigoDe({ ...todoMal, ...acumulado });
    });

    expect(codigos).toEqual([
      'NOMBRE_INVALIDO',
      'DPI_INVALIDO',
      'DATOS_DE_RESIDENCIA_REQUERIDOS',
      'HISTORIAL_EDUCATIVO_REQUERIDO',
      'DATOS_DE_COMUNICACION_REQUERIDOS',
      'CORREO_INVALIDO',
    ]);
  });
});
