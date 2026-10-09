import { beforeEach, describe, expect, it, vi } from 'vitest';
import { editarAccesoEnBackend } from '../data/accesos';
import { comoRol, rutasInvalidadas } from './apoyo-de-pruebas';
import { editarAcceso } from './editar-acceso';
import { errorDelBackend } from './sesiones-de-prueba';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn(), borrarToken: vi.fn() }));
vi.mock('@/shared/lib/http/cliente-backend', () => ({ solicitar: vi.fn() }));
vi.mock('../data/accesos', () => ({ editarAccesoEnBackend: vi.fn() }));

describe('editarAcceso', () => {
  beforeEach(() => {
    comoRol('SUPERVISOR_MUNICIPAL');
  });

  it('cambia el nombre e invalida las vistas del acceso', async () => {
    vi.mocked(editarAccesoEnBackend).mockResolvedValue({ ok: true, datos: undefined });

    await expect(editarAcceso('5', { nombre: ' Principal ' })).resolves.toEqual({ ok: true });

    expect(editarAccesoEnBackend).toHaveBeenCalledWith(5, { nombre: 'Principal' });
    expect(rutasInvalidadas()).toEqual(['/accesos', '/accesos/5', '/guardias']);
  });

  it('un nombre vacío es entrada inválida y no llama al backend', async () => {
    const resultado = await editarAcceso(5, { nombre: '  ' });

    expect(resultado).toMatchObject({
      ok: false,
      error: { codigo: 'ENTRADA_INVALIDA', detalles: [{ campo: 'datos.nombre' }] },
    });
    expect(editarAccesoEnBackend).not.toHaveBeenCalled();
  });

  it('un identificador que no es número es entrada inválida', async () => {
    const resultado = await editarAcceso('abc', { nombre: 'Norte' });

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
    expect(editarAccesoEnBackend).not.toHaveBeenCalled();
  });

  it.each(['OPERADOR_ESTACION', 'ADMINISTRADOR'] as const)(
    'niega el acceso al rol %s sin llamar al backend',
    async (rol) => {
      comoRol(rol);

      const resultado = await editarAcceso(5, { nombre: 'Norte' });

      expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ACCESO_DENEGADO' } });
      expect(editarAccesoEnBackend).not.toHaveBeenCalled();
    },
  );

  it('devuelve tal cual el error del backend', async () => {
    const error = errorDelBackend('ACCESO_NO_EXISTE', 404);
    vi.mocked(editarAccesoEnBackend).mockResolvedValue(error);

    await expect(editarAcceso(5, { nombre: 'Norte' })).resolves.toEqual(error);
  });
});
