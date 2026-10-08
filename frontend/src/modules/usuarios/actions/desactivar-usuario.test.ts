import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ErrorDeBackend } from '@/shared/lib/http/resultado';
import { autorizarAccion } from '@/shared/lib/sesion/sesion';
import type { Sesion } from '@/shared/schemas/sesion';
import { desactivarUsuarioEnBackend } from '../data/usuarios';
import { desactivarUsuario } from './desactivar-usuario';

vi.mock('../data/usuarios', () => ({ desactivarUsuarioEnBackend: vi.fn() }));
vi.mock('@/shared/lib/sesion/sesion', () => ({ autorizarAccion: vi.fn() }));
vi.mock('@/shared/lib/sesion/cookie', () => ({ borrarToken: vi.fn() }));

const ADMINISTRADOR: Sesion = {
  id: 1,
  nombre: 'Admin',
  correo: 'admin@transmetro.test',
  rol: 'ADMINISTRADOR',
  estacion: null,
};

function rechazo(codigo: string, estado: number): { ok: false; error: ErrorDeBackend } {
  return { ok: false, error: { codigo, mensaje: codigo, detalles: [], estado } };
}

describe('desactivarUsuario', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(autorizarAccion).mockResolvedValue({ ok: true, datos: ADMINISTRADOR });
  });

  it('desactiva al usuario e invalida el listado y el detalle', async () => {
    vi.mocked(desactivarUsuarioEnBackend).mockResolvedValue({ ok: true, datos: undefined });

    await expect(desactivarUsuario(5)).resolves.toEqual({ ok: true });

    expect(autorizarAccion).toHaveBeenCalledWith(['ADMINISTRADOR']);
    expect(desactivarUsuarioEnBackend).toHaveBeenCalledWith(5);
    expect(revalidatePath).toHaveBeenCalledWith('/usuarios');
    expect(revalidatePath).toHaveBeenCalledWith('/usuarios/5');
  });

  it.each([['abc'], [-2], [null]])(
    'rechaza el identificador %s sin llamar al backend',
    async (id) => {
      const resultado = await desactivarUsuario(id);

      expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
      expect(desactivarUsuarioEnBackend).not.toHaveBeenCalled();
    },
  );

  it('sin sesión responde NO_AUTENTICADO y no llama al backend', async () => {
    vi.mocked(autorizarAccion).mockResolvedValue(rechazo('NO_AUTENTICADO', 401));

    const resultado = await desactivarUsuario(5);

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'NO_AUTENTICADO' } });
    expect(desactivarUsuarioEnBackend).not.toHaveBeenCalled();
  });

  it('devuelve tal cual el rechazo del backend', async () => {
    const error = rechazo('AUTODESACTIVACION_NO_PERMITIDA', 422);
    vi.mocked(desactivarUsuarioEnBackend).mockResolvedValue(error);

    await expect(desactivarUsuario(5)).resolves.toEqual(error);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
