import { beforeEach, describe, expect, it, vi } from 'vitest';
import { asignarGuardiaEnBackend } from '../data/accesos';
import { asignarGuardia } from './asignar-guardia';
import { comoRol, rutasInvalidadas } from './apoyo-de-pruebas';
import { errorDelBackend } from './sesiones-de-prueba';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn(), borrarToken: vi.fn() }));
vi.mock('@/shared/lib/http/cliente-backend', () => ({ solicitar: vi.fn() }));
vi.mock('../data/accesos', () => ({ asignarGuardiaEnBackend: vi.fn() }));

const VALIDO = { guardiaId: '7', turno: '06:00-14:00' };

describe('asignarGuardia', () => {
  beforeEach(() => {
    comoRol('SUPERVISOR_MUNICIPAL');
  });

  it('llama al backend e invalida el acceso y los guardias', async () => {
    vi.mocked(asignarGuardiaEnBackend).mockResolvedValue({ ok: true, datos: undefined });

    await expect(asignarGuardia('5', VALIDO)).resolves.toEqual({ ok: true });

    expect(asignarGuardiaEnBackend).toHaveBeenCalledWith(5, { guardiaId: 7, turno: '06:00-14:00' });
    expect(rutasInvalidadas()).toEqual(['/accesos', '/accesos/5', '/guardias']);
  });

  it('un turno mal escrito es entrada inválida y no llama al backend', async () => {
    const resultado = await asignarGuardia(5, { ...VALIDO, turno: '25' });

    expect(resultado).toMatchObject({
      ok: false,
      error: { codigo: 'ENTRADA_INVALIDA', detalles: [{ campo: 'datos.turno' }] },
    });
    expect(asignarGuardiaEnBackend).not.toHaveBeenCalled();
  });

  it('un acceso que no es número es entrada inválida', async () => {
    const resultado = await asignarGuardia('abc', VALIDO);

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
    expect(asignarGuardiaEnBackend).not.toHaveBeenCalled();
  });

  it.each(['OPERADOR_ESTACION', 'ADMINISTRADOR'] as const)(
    'niega el acceso al rol %s sin llamar al backend',
    async (rol) => {
      comoRol(rol);

      const resultado = await asignarGuardia(5, VALIDO);

      expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ACCESO_DENEGADO' } });
      expect(asignarGuardiaEnBackend).not.toHaveBeenCalled();
    },
  );

  it('devuelve tal cual el error del backend', async () => {
    const error = errorDelBackend('TURNO_TRASLAPADO');
    vi.mocked(asignarGuardiaEnBackend).mockResolvedValue(error);

    await expect(asignarGuardia(5, VALIDO)).resolves.toEqual(error);
    expect(rutasInvalidadas()).toEqual([]);
  });
});
