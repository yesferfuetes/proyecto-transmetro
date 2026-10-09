import { beforeEach, describe, expect, it, vi } from 'vitest';
import { quitarAsignacionEnBackend } from '../data/accesos';
import { quitarAsignacion } from './quitar-asignacion';
import { comoRol, rutasInvalidadas } from './apoyo-de-pruebas';
import { errorDelBackend } from './sesiones-de-prueba';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn(), borrarToken: vi.fn() }));
vi.mock('@/shared/lib/http/cliente-backend', () => ({ solicitar: vi.fn() }));
vi.mock('../data/accesos', () => ({ quitarAsignacionEnBackend: vi.fn() }));

const VALIDO = { guardiaId: '7', turno: '06:00-14:00' };

describe('quitarAsignacion', () => {
  beforeEach(() => {
    comoRol('SUPERVISOR_MUNICIPAL');
  });

  it('llama al backend e invalida el acceso y los guardias', async () => {
    vi.mocked(quitarAsignacionEnBackend).mockResolvedValue({ ok: true, datos: undefined });

    await expect(quitarAsignacion('5', VALIDO)).resolves.toEqual({ ok: true });

    expect(quitarAsignacionEnBackend).toHaveBeenCalledWith(5, {
      guardiaId: 7,
      turno: '06:00-14:00',
    });
    expect(rutasInvalidadas()).toEqual(['/accesos', '/accesos/5', '/guardias']);
  });

  it('un turno mal escrito es entrada inválida y no llama al backend', async () => {
    const resultado = await quitarAsignacion(5, { ...VALIDO, turno: '25' });

    expect(resultado).toMatchObject({
      ok: false,
      error: { codigo: 'ENTRADA_INVALIDA', detalles: [{ campo: 'datos.turno' }] },
    });
    expect(quitarAsignacionEnBackend).not.toHaveBeenCalled();
  });

  it('un acceso que no es número es entrada inválida', async () => {
    const resultado = await quitarAsignacion('abc', VALIDO);

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
    expect(quitarAsignacionEnBackend).not.toHaveBeenCalled();
  });

  it.each(['OPERADOR_ESTACION', 'ADMINISTRADOR'] as const)(
    'niega el acceso al rol %s sin llamar al backend',
    async (rol) => {
      comoRol(rol);

      const resultado = await quitarAsignacion(5, VALIDO);

      expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ACCESO_DENEGADO' } });
      expect(quitarAsignacionEnBackend).not.toHaveBeenCalled();
    },
  );

  it('devuelve tal cual el error del backend', async () => {
    const error = errorDelBackend('ACCESO_SIN_GUARDIA');
    vi.mocked(quitarAsignacionEnBackend).mockResolvedValue(error);

    await expect(quitarAsignacion(5, VALIDO)).resolves.toEqual(error);
    expect(rutasInvalidadas()).toEqual([]);
  });
});
