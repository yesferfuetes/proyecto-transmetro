import { beforeEach, describe, expect, it, vi } from 'vitest';
import { registrarAccesoEnBackend } from '../data/accesos';
import { comoRol, rutasInvalidadas } from './apoyo-de-pruebas';
import { registrarAcceso } from './registrar-acceso';
import { errorDelBackend } from './sesiones-de-prueba';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn(), borrarToken: vi.fn() }));
vi.mock('@/shared/lib/http/cliente-backend', () => ({ solicitar: vi.fn() }));
vi.mock('../data/accesos', () => ({ registrarAccesoEnBackend: vi.fn() }));
vi.mock('next/navigation', () => ({
  redirect: vi.fn((destino: string) => {
    throw new Error(`redirect:${destino}`);
  }),
}));

const VALIDO = { estacionId: '3', codigo: 'C', nombre: '', guardiaId: '7', turno: '06:00-14:00' };

describe('registrarAcceso', () => {
  beforeEach(() => {
    comoRol('SUPERVISOR_MUNICIPAL');
  });

  it('registra el acceso, invalida las vistas y lleva al detalle', async () => {
    vi.mocked(registrarAccesoEnBackend).mockResolvedValue({ ok: true, datos: { id: 41 } });

    await expect(registrarAcceso(VALIDO)).rejects.toThrow('redirect:/accesos/41');

    expect(registrarAccesoEnBackend).toHaveBeenCalledWith({
      estacionId: 3,
      codigo: 'C',
      nombre: undefined,
      guardiaId: 7,
      turno: '06:00-14:00',
    });
    expect(rutasInvalidadas()).toEqual(['/accesos', '/accesos/41', '/guardias']);
  });

  it('un turno mal escrito es entrada inválida y no llama al backend', async () => {
    const resultado = await registrarAcceso({ ...VALIDO, turno: '6 a 14' });

    expect(resultado).toMatchObject({
      ok: false,
      error: { codigo: 'ENTRADA_INVALIDA', detalles: [{ campo: 'turno' }] },
    });
    expect(registrarAccesoEnBackend).not.toHaveBeenCalled();
  });

  it('sin guardia es entrada inválida y no llama al backend', async () => {
    const resultado = await registrarAcceso({ ...VALIDO, guardiaId: '' });

    expect(resultado).toMatchObject({
      ok: false,
      error: { detalles: [{ campo: 'guardiaId', mensajes: ['Elige un guardia.'] }] },
    });
    expect(registrarAccesoEnBackend).not.toHaveBeenCalled();
  });

  it.each(['OPERADOR_ESTACION', 'ADMINISTRADOR'] as const)(
    'niega el acceso al rol %s sin llamar al backend',
    async (rol) => {
      comoRol(rol);

      const resultado = await registrarAcceso(VALIDO);

      expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ACCESO_DENEGADO' } });
      expect(registrarAccesoEnBackend).not.toHaveBeenCalled();
    },
  );

  it('devuelve tal cual el error del backend', async () => {
    const error = errorDelBackend('CODIGO_ACCESO_DUPLICADO', 409);
    vi.mocked(registrarAccesoEnBackend).mockResolvedValue(error);

    await expect(registrarAcceso(VALIDO)).resolves.toEqual(error);
    expect(rutasInvalidadas()).toEqual([]);
  });
});
