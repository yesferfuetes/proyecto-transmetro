import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ErrorDeBackend } from '@/shared/lib/http/resultado';
import { autorizarAccion } from '@/shared/lib/sesion/sesion';
import type { Sesion } from '@/shared/schemas/sesion';
import { editarUsuarioEnBackend } from '../data/usuarios';
import { editarUsuario } from './editar-usuario';

vi.mock('../data/usuarios', () => ({ editarUsuarioEnBackend: vi.fn() }));
vi.mock('@/shared/lib/sesion/sesion', () => ({ autorizarAccion: vi.fn() }));
vi.mock('@/shared/lib/sesion/cookie', () => ({ borrarToken: vi.fn() }));

const ADMINISTRADOR: Sesion = {
  id: 1,
  nombre: 'Admin',
  correo: 'admin@transmetro.test',
  rol: 'ADMINISTRADOR',
  estacion: null,
};

const CAMBIOS = {
  nombre: 'Luis Pérez',
  correo: 'luis@transmetro.test',
  rol: 'SUPERVISOR_MUNICIPAL',
};

function rechazo(codigo: string, estado: number): { ok: false; error: ErrorDeBackend } {
  return { ok: false, error: { codigo, mensaje: codigo, detalles: [], estado } };
}

describe('editarUsuario', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(autorizarAccion).mockResolvedValue({ ok: true, datos: ADMINISTRADOR });
  });

  it('guarda; sin estación la retira, e invalida el listado y el detalle', async () => {
    vi.mocked(editarUsuarioEnBackend).mockResolvedValue({ ok: true, datos: undefined });

    await expect(editarUsuario(5, CAMBIOS)).resolves.toEqual({ ok: true });

    expect(autorizarAccion).toHaveBeenCalledWith(['ADMINISTRADOR']);
    expect(editarUsuarioEnBackend).toHaveBeenCalledWith(5, { ...CAMBIOS, estacionId: null });
    expect(revalidatePath).toHaveBeenCalledWith('/usuarios');
    expect(revalidatePath).toHaveBeenCalledWith('/usuarios/5');
  });

  it.each([
    ['un identificador que no es entero', 'abc', CAMBIOS],
    ['un operador sin estación', 5, { ...CAMBIOS, rol: 'OPERADOR_ESTACION' }],
    ['un nombre vacío', 5, { ...CAMBIOS, nombre: '   ' }],
  ])('rechaza %s sin llamar al backend', async (_caso, id, cambios) => {
    const resultado = await editarUsuario(id, cambios);

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
    expect(editarUsuarioEnBackend).not.toHaveBeenCalled();
  });

  it('sin permiso responde ACCESO_DENEGADO y no llama al backend', async () => {
    vi.mocked(autorizarAccion).mockResolvedValue(rechazo('ACCESO_DENEGADO', 403));

    const resultado = await editarUsuario(5, CAMBIOS);

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ACCESO_DENEGADO' } });
    expect(editarUsuarioEnBackend).not.toHaveBeenCalled();
  });

  it('devuelve tal cual el rechazo del backend por último administrador', async () => {
    const error = rechazo('ULTIMO_ADMINISTRADOR', 422);
    vi.mocked(editarUsuarioEnBackend).mockResolvedValue(error);

    await expect(editarUsuario(1, { ...CAMBIOS, rol: 'SUPERVISOR_MUNICIPAL' })).resolves.toEqual(
      error,
    );
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
