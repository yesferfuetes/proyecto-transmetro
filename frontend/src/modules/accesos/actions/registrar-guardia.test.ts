import { beforeEach, describe, expect, it, vi } from 'vitest';
import { registrarGuardiaEnBackend } from '../data/guardias';
import { comoRol, rutasInvalidadas } from './apoyo-de-pruebas';
import { registrarGuardia } from './registrar-guardia';
import { errorDelBackend } from './sesiones-de-prueba';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn(), borrarToken: vi.fn() }));
vi.mock('@/shared/lib/http/cliente-backend', () => ({ solicitar: vi.fn() }));
vi.mock('../data/guardias', () => ({ registrarGuardiaEnBackend: vi.fn() }));
vi.mock('next/navigation', () => ({
  redirect: vi.fn((destino: string) => {
    throw new Error(`redirect:${destino}`);
  }),
}));

const VALIDO = { nombre: ' Ana Pérez ', dpi: '1234 56789 0101', telefono: '5555-5555' };

describe('registrarGuardia', () => {
  beforeEach(() => {
    comoRol('SUPERVISOR_MUNICIPAL');
  });

  it('guarda al guardia, invalida el listado y vuelve a él', async () => {
    vi.mocked(registrarGuardiaEnBackend).mockResolvedValue({ ok: true, datos: { id: 9 } });

    await expect(registrarGuardia(VALIDO)).rejects.toThrow('redirect:/guardias');

    expect(registrarGuardiaEnBackend).toHaveBeenCalledWith({
      nombre: 'Ana Pérez',
      dpi: '1234 56789 0101',
      telefono: '5555-5555',
    });
    expect(rutasInvalidadas()).toEqual(['/guardias']);
  });

  it('un DPI de menos de 13 dígitos es entrada inválida y no llama al backend', async () => {
    const resultado = await registrarGuardia({ ...VALIDO, dpi: '1234' });

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
    expect(registrarGuardiaEnBackend).not.toHaveBeenCalled();
  });

  it('un teléfono de 7 dígitos es entrada inválida y no llama al backend', async () => {
    const resultado = await registrarGuardia({ ...VALIDO, telefono: '5555-555' });

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
    expect(registrarGuardiaEnBackend).not.toHaveBeenCalled();
  });

  it.each(['OPERADOR_ESTACION', 'ADMINISTRADOR'] as const)(
    'niega el acceso al rol %s sin llamar al backend',
    async (rol) => {
      comoRol(rol);

      const resultado = await registrarGuardia(VALIDO);

      expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ACCESO_DENEGADO' } });
      expect(registrarGuardiaEnBackend).not.toHaveBeenCalled();
    },
  );

  it('devuelve tal cual el error del backend', async () => {
    const error = errorDelBackend('DPI_GUARDIA_DUPLICADO', 409);
    vi.mocked(registrarGuardiaEnBackend).mockResolvedValue(error);

    await expect(registrarGuardia(VALIDO)).resolves.toEqual(error);
  });
});
