import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ErrorDeBackend } from '@/shared/lib/http/resultado';
import { autorizarAccion } from '@/shared/lib/sesion/sesion';
import type { Sesion } from '@/shared/schemas/sesion';
import { reactivarUsuarioEnBackend } from '../data/usuarios';
import { reactivarUsuario } from './reactivar-usuario';

vi.mock('../data/usuarios', () => ({ reactivarUsuarioEnBackend: vi.fn() }));
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

describe('reactivarUsuario', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(autorizarAccion).mockResolvedValue({ ok: true, datos: ADMINISTRADOR });
  });

  it('reactiva al usuario e invalida el listado y el detalle', async () => {
    vi.mocked(reactivarUsuarioEnBackend).mockResolvedValue({ ok: true, datos: undefined });

    await expect(reactivarUsuario(5)).resolves.toEqual({ ok: true });

    expect(autorizarAccion).toHaveBeenCalledWith(['ADMINISTRADOR']);
    expect(reactivarUsuarioEnBackend).toHaveBeenCalledWith(5);
    expect(revalidatePath).toHaveBeenCalledWith('/usuarios');
    expect(revalidatePath).toHaveBeenCalledWith('/usuarios/5');
  });

  it.each([['abc'], [-2], [null]])(
    'rechaza el identificador %s sin llamar al backend',
    async (id) => {
      const resultado = await reactivarUsuario(id);

      expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
      expect(reactivarUsuarioEnBackend).not.toHaveBeenCalled();
    },
  );

  it('sin sesión responde NO_AUTENTICADO y no llama al backend', async () => {
    vi.mocked(autorizarAccion).mockResolvedValue(rechazo('NO_AUTENTICADO', 401));

    const resultado = await reactivarUsuario(5);

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'NO_AUTENTICADO' } });
    expect(reactivarUsuarioEnBackend).not.toHaveBeenCalled();
  });

  it('devuelve tal cual el rechazo del backend', async () => {
    const error = rechazo('USUARIO_NO_EXISTE', 422);
    vi.mocked(reactivarUsuarioEnBackend).mockResolvedValue(error);

    await expect(reactivarUsuario(5)).resolves.toEqual(error);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
