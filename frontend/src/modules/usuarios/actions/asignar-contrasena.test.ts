import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ErrorDeBackend } from '@/shared/lib/http/resultado';
import { autorizarAccion } from '@/shared/lib/sesion/sesion';
import type { Sesion } from '@/shared/schemas/sesion';
import { asignarContrasenaEnBackend } from '../data/usuarios';
import { asignarContrasena } from './asignar-contrasena';

vi.mock('../data/usuarios', () => ({ asignarContrasenaEnBackend: vi.fn() }));
vi.mock('@/shared/lib/sesion/sesion', () => ({ autorizarAccion: vi.fn() }));
vi.mock('@/shared/lib/sesion/cookie', () => ({ borrarToken: vi.fn() }));

const ADMINISTRADOR: Sesion = {
  id: 1,
  nombre: 'Admin',
  correo: 'admin@transmetro.test',
  rol: 'ADMINISTRADOR',
  estacion: null,
};

const VALIDA = { contrasena: 'nueva1234', confirmacion: 'nueva1234' };

function rechazo(codigo: string, estado: number): { ok: false; error: ErrorDeBackend } {
  return { ok: false, error: { codigo, mensaje: codigo, detalles: [], estado } };
}

describe('asignarContrasena', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(autorizarAccion).mockResolvedValue({ ok: true, datos: ADMINISTRADOR });
  });

  it('envía solo la contraseña nueva e invalida el detalle', async () => {
    vi.mocked(asignarContrasenaEnBackend).mockResolvedValue({ ok: true, datos: undefined });

    await expect(asignarContrasena(5, VALIDA)).resolves.toEqual({ ok: true });

    expect(autorizarAccion).toHaveBeenCalledWith(['ADMINISTRADOR']);
    expect(asignarContrasenaEnBackend).toHaveBeenCalledWith(5, 'nueva1234');
    expect(revalidatePath).toHaveBeenCalledWith('/usuarios/5');
  });

  it.each([
    ['sin número', { contrasena: 'abcdefgh', confirmacion: 'abcdefgh' }, 'contrasena'],
    ['corta', { contrasena: 'abc123', confirmacion: 'abc123' }, 'contrasena'],
    [
      'con confirmación distinta',
      { contrasena: 'nueva1234', confirmacion: 'otra1234' },
      'confirmacion',
    ],
  ])('rechaza una contraseña %s sin llamar al backend', async (_caso, entrada, campo) => {
    const resultado = await asignarContrasena(5, entrada);

    expect(resultado).toMatchObject({
      ok: false,
      error: { codigo: 'ENTRADA_INVALIDA', detalles: [expect.objectContaining({ campo })] },
    });
    expect(asignarContrasenaEnBackend).not.toHaveBeenCalled();
  });

  it('sin permiso responde ACCESO_DENEGADO y no llama al backend', async () => {
    vi.mocked(autorizarAccion).mockResolvedValue(rechazo('ACCESO_DENEGADO', 403));

    const resultado = await asignarContrasena(5, VALIDA);

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ACCESO_DENEGADO' } });
    expect(asignarContrasenaEnBackend).not.toHaveBeenCalled();
  });

  it('devuelve tal cual el rechazo del backend', async () => {
    const error = rechazo('CONTRASENA_DEBIL', 422);
    vi.mocked(asignarContrasenaEnBackend).mockResolvedValue(error);

    await expect(asignarContrasena(5, VALIDA)).resolves.toEqual(error);
  });
});
