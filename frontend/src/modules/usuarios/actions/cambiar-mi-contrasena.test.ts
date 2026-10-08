import { beforeEach, describe, expect, it, vi } from 'vitest';
import { autorizarAccion } from '@/shared/lib/sesion/sesion';
import type { Sesion } from '@/shared/schemas/sesion';
import { cambiarMiContrasenaEnBackend } from '../data/usuarios';
import { cambiarMiContrasena } from './cambiar-mi-contrasena';

vi.mock('../data/usuarios', () => ({ cambiarMiContrasenaEnBackend: vi.fn() }));
vi.mock('@/shared/lib/sesion/sesion', () => ({ autorizarAccion: vi.fn() }));
vi.mock('@/shared/lib/sesion/cookie', () => ({ borrarToken: vi.fn() }));

const OPERADOR: Sesion = {
  id: 4,
  nombre: 'Luis',
  correo: 'luis@transmetro.test',
  rol: 'OPERADOR_ESTACION',
  estacion: { id: 3, codigo: 'E03', nombre: 'Trébol' },
};

const VALIDO = {
  contrasenaActual: 'actual123',
  contrasenaNueva: 'nueva1234',
  confirmacion: 'nueva1234',
};

describe('cambiarMiContrasena', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(autorizarAccion).mockResolvedValue({ ok: true, datos: OPERADOR });
  });

  it('cualquier rol con sesión cambia su contraseña sin enviar la confirmación', async () => {
    vi.mocked(cambiarMiContrasenaEnBackend).mockResolvedValue({ ok: true, datos: undefined });

    await expect(cambiarMiContrasena(VALIDO)).resolves.toEqual({ ok: true });

    expect(autorizarAccion).toHaveBeenCalledWith();
    expect(cambiarMiContrasenaEnBackend).toHaveBeenCalledWith({
      contrasenaActual: 'actual123',
      contrasenaNueva: 'nueva1234',
    });
  });

  it('con la confirmación distinta no llama al backend', async () => {
    const resultado = await cambiarMiContrasena({ ...VALIDO, confirmacion: 'otra12345' });

    expect(resultado).toMatchObject({
      ok: false,
      error: { codigo: 'ENTRADA_INVALIDA', detalles: [{ campo: 'confirmacion' }] },
    });
    expect(cambiarMiContrasenaEnBackend).not.toHaveBeenCalled();
  });

  it('sin sesión responde NO_AUTENTICADO y no llama al backend', async () => {
    vi.mocked(autorizarAccion).mockResolvedValue({
      ok: false,
      error: { codigo: 'NO_AUTENTICADO', mensaje: 'Sin sesión', detalles: [], estado: 401 },
    });

    const resultado = await cambiarMiContrasena(VALIDO);

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'NO_AUTENTICADO' } });
    expect(cambiarMiContrasenaEnBackend).not.toHaveBeenCalled();
  });

  it('devuelve tal cual la contraseña actual incorrecta', async () => {
    const error = {
      ok: false as const,
      error: {
        codigo: 'CREDENCIALES_INVALIDAS',
        mensaje: 'La contraseña actual no es correcta.',
        detalles: [],
        estado: 401,
      },
    };
    vi.mocked(cambiarMiContrasenaEnBackend).mockResolvedValue(error);

    await expect(cambiarMiContrasena(VALIDO)).resolves.toEqual(error);
  });
});
