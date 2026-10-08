import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ErrorDeBackend } from '@/shared/lib/http/resultado';
import { borrarToken } from '@/shared/lib/sesion/cookie';
import { autorizarAccion } from '@/shared/lib/sesion/sesion';
import type { Sesion } from '@/shared/schemas/sesion';
import { registrarUsuarioEnBackend } from '../data/usuarios';
import { registrarUsuario } from './registrar-usuario';

vi.mock('../data/usuarios', () => ({ registrarUsuarioEnBackend: vi.fn() }));
vi.mock('@/shared/lib/sesion/sesion', () => ({ autorizarAccion: vi.fn() }));
vi.mock('@/shared/lib/sesion/cookie', () => ({ borrarToken: vi.fn() }));
vi.mock('next/navigation', () => ({
  redirect: vi.fn((destino: string) => {
    throw new Error(`redirect:${destino}`);
  }),
}));

const ADMINISTRADOR: Sesion = {
  id: 1,
  nombre: 'Admin',
  correo: 'admin@transmetro.test',
  rol: 'ADMINISTRADOR',
  estacion: null,
};

const OPERADOR = {
  nombre: 'Luis Pérez',
  correo: 'luis@transmetro.test',
  rol: 'OPERADOR_ESTACION',
  contrasena: 'clave1234',
  estacionId: 3,
};

function rechazo(codigo: string, estado: number): { ok: false; error: ErrorDeBackend } {
  return { ok: false, error: { codigo, mensaje: codigo, detalles: [], estado } };
}

function camposMarcados(resultado: Awaited<ReturnType<typeof registrarUsuario>>): string[] {
  return resultado.ok ? [] : resultado.error.detalles.map((detalle) => detalle.campo);
}

describe('registrarUsuario', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(autorizarAccion).mockResolvedValue({ ok: true, datos: ADMINISTRADOR });
  });

  it('registra, invalida el listado y vuelve a él', async () => {
    vi.mocked(registrarUsuarioEnBackend).mockResolvedValue({ ok: true, datos: { id: 7 } });

    await expect(registrarUsuario(OPERADOR)).rejects.toThrow('redirect:/usuarios');

    expect(autorizarAccion).toHaveBeenCalledWith(['ADMINISTRADOR']);
    expect(registrarUsuarioEnBackend).toHaveBeenCalledWith(OPERADOR);
    expect(revalidatePath).toHaveBeenCalledWith('/usuarios');
  });

  it('a un supervisor no le envía estación', async () => {
    vi.mocked(registrarUsuarioEnBackend).mockResolvedValue({ ok: true, datos: { id: 8 } });

    await expect(
      registrarUsuario({ ...OPERADOR, rol: 'SUPERVISOR_MUNICIPAL', estacionId: undefined }),
    ).rejects.toThrow('redirect:/usuarios');

    expect(registrarUsuarioEnBackend).toHaveBeenCalledWith(
      expect.objectContaining({ rol: 'SUPERVISOR_MUNICIPAL', estacionId: undefined }),
    );
  });

  it('rechaza un operador sin estación sin llamar al backend', async () => {
    const resultado = await registrarUsuario({ ...OPERADOR, estacionId: null });

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
    expect(camposMarcados(resultado)).toEqual(['estacionId']);
    expect(registrarUsuarioEnBackend).not.toHaveBeenCalled();
  });

  it('rechaza un correo mal formado sin llamar al backend', async () => {
    const resultado = await registrarUsuario({ ...OPERADOR, correo: 'luis.transmetro' });

    expect(camposMarcados(resultado)).toEqual(['correo']);
    expect(registrarUsuarioEnBackend).not.toHaveBeenCalled();
  });

  it('sin sesión responde NO_AUTENTICADO y no llama al backend', async () => {
    vi.mocked(autorizarAccion).mockResolvedValue(rechazo('NO_AUTENTICADO', 401));

    const resultado = await registrarUsuario(OPERADOR);

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'NO_AUTENTICADO' } });
    expect(registrarUsuarioEnBackend).not.toHaveBeenCalled();
  });

  it('a un supervisor le responde ACCESO_DENEGADO sin llamar al backend', async () => {
    vi.mocked(autorizarAccion).mockResolvedValue(rechazo('ACCESO_DENEGADO', 403));

    const resultado = await registrarUsuario(OPERADOR);

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ACCESO_DENEGADO' } });
    expect(registrarUsuarioEnBackend).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('devuelve tal cual el correo duplicado del backend', async () => {
    const error = rechazo('EMAIL_DUPLICADO', 409);
    vi.mocked(registrarUsuarioEnBackend).mockResolvedValue(error);

    await expect(registrarUsuario(OPERADOR)).resolves.toEqual(error);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('con la sesión vencida la cierra y lleva a iniciarla', async () => {
    vi.mocked(registrarUsuarioEnBackend).mockResolvedValue(rechazo('SESION_EXPIRADA', 401));

    await expect(registrarUsuario(OPERADOR)).rejects.toThrow('redirect:/login?motivo=expirada');
    expect(borrarToken).toHaveBeenCalledOnce();
    expect(redirect).toHaveBeenCalledWith('/login?motivo=expirada');
  });
});
