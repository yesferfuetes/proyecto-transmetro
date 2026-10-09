import { beforeEach, describe, expect, it, vi } from 'vitest';
import { editarGuardiaEnBackend } from '../data/guardias';
import { comoRol, rutasInvalidadas } from './apoyo-de-pruebas';
import { editarGuardia } from './editar-guardia';
import { errorDelBackend } from './sesiones-de-prueba';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn(), borrarToken: vi.fn() }));
vi.mock('@/shared/lib/http/cliente-backend', () => ({ solicitar: vi.fn() }));
vi.mock('../data/guardias', () => ({ editarGuardiaEnBackend: vi.fn() }));
vi.mock('next/navigation', () => ({
  redirect: vi.fn((destino: string) => {
    throw new Error(`redirect:${destino}`);
  }),
}));

const VALIDO = { nombre: ' Ana Pérez ', dpi: '1234 56789 0101', telefono: '5555-5555' };

describe('editarGuardia', () => {
  beforeEach(() => {
    comoRol('SUPERVISOR_MUNICIPAL');
  });

  it('guarda al guardia, invalida el listado y vuelve a él', async () => {
    vi.mocked(editarGuardiaEnBackend).mockResolvedValue({ ok: true, datos: undefined });

    await expect(editarGuardia('9', VALIDO)).rejects.toThrow('redirect:/guardias');

    expect(editarGuardiaEnBackend).toHaveBeenCalledWith(9, {
      nombre: 'Ana Pérez',
      dpi: '1234 56789 0101',
      telefono: '5555-5555',
    });
    expect(rutasInvalidadas()).toEqual(['/guardias']);
  });

  it('un DPI de menos de 13 dígitos es entrada inválida y no llama al backend', async () => {
    const resultado = await editarGuardia(9, { ...VALIDO, dpi: '1234' });

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
    expect(editarGuardiaEnBackend).not.toHaveBeenCalled();
  });

  it('un teléfono de 7 dígitos es entrada inválida y no llama al backend', async () => {
    const resultado = await editarGuardia(9, { ...VALIDO, telefono: '5555-555' });

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
    expect(editarGuardiaEnBackend).not.toHaveBeenCalled();
  });

  it.each(['OPERADOR_ESTACION', 'ADMINISTRADOR'] as const)(
    'niega el acceso al rol %s sin llamar al backend',
    async (rol) => {
      comoRol(rol);

      const resultado = await editarGuardia(9, VALIDO);

      expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ACCESO_DENEGADO' } });
      expect(editarGuardiaEnBackend).not.toHaveBeenCalled();
    },
  );

  it('devuelve tal cual el error del backend', async () => {
    const error = errorDelBackend('DPI_GUARDIA_DUPLICADO', 409);
    vi.mocked(editarGuardiaEnBackend).mockResolvedValue(error);

    await expect(editarGuardia(9, VALIDO)).resolves.toEqual(error);
  });
});
