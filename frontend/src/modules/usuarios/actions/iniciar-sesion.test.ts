import { redirect } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ErrorDeBackend } from '@/shared/lib/http/resultado';
import { guardarToken } from '@/shared/lib/sesion/cookie';
import { crearSesion } from '../data/sesiones';
import { iniciarSesion } from './iniciar-sesion';

vi.mock('../data/sesiones', () => ({ crearSesion: vi.fn() }));
vi.mock('@/shared/lib/sesion/cookie', () => ({ guardarToken: vi.fn() }));
vi.mock('next/navigation', () => ({
  redirect: vi.fn((destino: string) => {
    throw new Error(`redirect:${destino}`);
  }),
}));

const CREDENCIALES = { correo: 'ana@transmetro.test', contrasena: 'clave1234' };

function rechazo(
  codigo: string,
  estado: number,
  mensaje = codigo,
): { ok: false; error: ErrorDeBackend } {
  return { ok: false, error: { codigo, mensaje, detalles: [], estado } };
}

describe('iniciarSesion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('con credenciales correctas guarda la cookie y lleva a Inicio', async () => {
    vi.mocked(crearSesion).mockResolvedValue({
      ok: true,
      datos: { token: 'tok', expiraEn: '2026-10-07T20:00:00Z' },
    });

    await expect(iniciarSesion(CREDENCIALES)).rejects.toThrow('redirect:/inicio');

    expect(crearSesion).toHaveBeenCalledWith(CREDENCIALES);
    expect(guardarToken).toHaveBeenCalledWith('tok', '2026-10-07T20:00:00Z');
    expect(redirect).toHaveBeenCalledWith('/inicio');
  });

  it('con entrada inválida no llama al backend y marca cada campo', async () => {
    const resultado = await iniciarSesion({ correo: 'no-es-correo', contrasena: '' });

    expect(crearSesion).not.toHaveBeenCalled();
    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ENTRADA_INVALIDA' } });
    const campos = resultado.ok ? [] : resultado.error.detalles.map((detalle) => detalle.campo);
    expect(campos).toEqual(['correo', 'contrasena']);
  });

  it('devuelve tal cual el rechazo de credenciales del backend', async () => {
    const error = rechazo('CREDENCIALES_INVALIDAS', 401, 'Correo o contraseña incorrectos.');
    vi.mocked(crearSesion).mockResolvedValue(error);

    await expect(iniciarSesion(CREDENCIALES)).resolves.toEqual(error);
    expect(guardarToken).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it('informa el tiempo agotado sin abrir sesión', async () => {
    vi.mocked(crearSesion).mockResolvedValue(rechazo('TIEMPO_AGOTADO', 0));

    const resultado = await iniciarSesion(CREDENCIALES);

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'TIEMPO_AGOTADO' } });
    expect(guardarToken).not.toHaveBeenCalled();
  });
});
