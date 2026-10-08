import { redirect } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { solicitar } from '@/shared/lib/http/cliente-backend';
import type { ErrorDeBackend } from '@/shared/lib/http/resultado';
import type { Sesion } from '@/shared/schemas/sesion';
import { leerToken } from './cookie';
import { autorizarAccion, exigirSesion, obtenerSesion } from './sesion';

vi.mock('./cookie', () => ({ leerToken: vi.fn() }));
vi.mock('@/shared/lib/http/cliente-backend', () => ({ solicitar: vi.fn() }));
vi.mock('next/navigation', () => ({
  redirect: vi.fn((destino: string) => {
    throw new Error(`redirect:${destino}`);
  }),
}));

const SUPERVISOR: Sesion = {
  id: 2,
  nombre: 'Ana',
  correo: 'ana@transmetro.test',
  rol: 'SUPERVISOR_MUNICIPAL',
  estacion: null,
};

function errorDelBackend(codigo: string, estado: number): { ok: false; error: ErrorDeBackend } {
  return { ok: false, error: { codigo, mensaje: codigo, detalles: [], estado } };
}

describe('sesión del servidor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('obtenerSesion', () => {
    it('sin cookie no hay sesión y no se llama al backend', async () => {
      vi.mocked(leerToken).mockResolvedValue(undefined);

      await expect(obtenerSesion()).resolves.toBeNull();
      expect(solicitar).not.toHaveBeenCalled();
    });

    it('con cookie pide la cuenta con el token', async () => {
      vi.mocked(leerToken).mockResolvedValue('tok');
      vi.mocked(solicitar).mockResolvedValue({ ok: true, datos: SUPERVISOR });

      await expect(obtenerSesion()).resolves.toEqual(SUPERVISOR);
      expect(solicitar).toHaveBeenCalledWith(
        expect.objectContaining({ ruta: '/usuarios/yo', token: 'tok' }),
      );
    });

    it.each([
      ['SESION_EXPIRADA', 401],
      ['NO_AUTENTICADO', 401],
    ])('si el backend responde %s no hay sesión', async (codigo, estado) => {
      vi.mocked(leerToken).mockResolvedValue('tok');
      vi.mocked(solicitar).mockResolvedValue(errorDelBackend(codigo, estado));

      await expect(obtenerSesion()).resolves.toBeNull();
    });

    it('si el backend no responde, no lo confunde con una sesión vencida', async () => {
      vi.mocked(leerToken).mockResolvedValue('tok');
      vi.mocked(solicitar).mockResolvedValue(errorDelBackend('TIEMPO_AGOTADO', 0));

      await expect(obtenerSesion()).rejects.toThrow('TIEMPO_AGOTADO');
    });
  });

  describe('exigirSesion', () => {
    it('sin cookie lleva a iniciar sesión', async () => {
      vi.mocked(leerToken).mockResolvedValue(undefined);

      await expect(exigirSesion()).rejects.toThrow('redirect:/login');
      expect(redirect).toHaveBeenCalledWith('/login');
    });

    it('con la sesión vencida avisa que expiró', async () => {
      vi.mocked(leerToken).mockResolvedValue('tok');
      vi.mocked(solicitar).mockResolvedValue(errorDelBackend('SESION_EXPIRADA', 401));

      await expect(exigirSesion()).rejects.toThrow('redirect:/login?motivo=expirada');
    });

    it('con un rol no permitido lleva a acceso denegado', async () => {
      vi.mocked(leerToken).mockResolvedValue('tok');
      vi.mocked(solicitar).mockResolvedValue({ ok: true, datos: SUPERVISOR });

      await expect(exigirSesion(['ADMINISTRADOR'])).rejects.toThrow('redirect:/acceso-denegado');
    });

    it('con un rol permitido devuelve la sesión', async () => {
      vi.mocked(leerToken).mockResolvedValue('tok');
      vi.mocked(solicitar).mockResolvedValue({ ok: true, datos: SUPERVISOR });

      await expect(exigirSesion(['SUPERVISOR_MUNICIPAL', 'ADMINISTRADOR'])).resolves.toEqual(
        SUPERVISOR,
      );
      expect(redirect).not.toHaveBeenCalled();
    });
  });

  describe('autorizarAccion', () => {
    it('sin sesión devuelve NO_AUTENTICADO sin redirigir', async () => {
      vi.mocked(leerToken).mockResolvedValue(undefined);

      const resultado = await autorizarAccion();

      expect(resultado).toMatchObject({ ok: false, error: { codigo: 'NO_AUTENTICADO' } });
      expect(redirect).not.toHaveBeenCalled();
    });

    it('con un rol no permitido devuelve ACCESO_DENEGADO', async () => {
      vi.mocked(leerToken).mockResolvedValue('tok');
      vi.mocked(solicitar).mockResolvedValue({ ok: true, datos: SUPERVISOR });

      const resultado = await autorizarAccion(['ADMINISTRADOR']);

      expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ACCESO_DENEGADO' } });
    });

    it('con sesión y sin roles exigidos la devuelve', async () => {
      vi.mocked(leerToken).mockResolvedValue('tok');
      vi.mocked(solicitar).mockResolvedValue({ ok: true, datos: SUPERVISOR });

      await expect(autorizarAccion()).resolves.toEqual({ ok: true, datos: SUPERVISOR });
    });
  });
});
