import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cookiesSimuladas as almacen } from '../../../../test/simulaciones-next';
import { borrarToken, guardarToken, leerToken, NOMBRE_COOKIE_SESION } from './cookie';

const AHORA = Date.parse('2026-10-07T12:00:00Z');

describe('cookie de sesión', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: AHORA });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it('se guarda httpOnly, lax, en toda la app y hasta su vencimiento', async () => {
    await guardarToken('tok', '2026-10-07T20:00:00Z');

    expect(almacen.set).toHaveBeenCalledWith(NOMBRE_COOKIE_SESION, 'tok', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60,
    });
  });

  it('en producción solo viaja por HTTPS', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    await guardarToken('tok', '2026-10-07T13:00:00Z');

    expect(almacen.set).toHaveBeenCalledWith(
      NOMBRE_COOKIE_SESION,
      'tok',
      expect.objectContaining({ secure: true, maxAge: 3600 }),
    );
  });

  it('nunca dura más de ocho horas ni menos de cero', async () => {
    await guardarToken('a', '2026-10-09T00:00:00Z');
    await guardarToken('b', '2026-10-07T11:00:00Z');
    await guardarToken('c', 'no es fecha');

    const duraciones = almacen.set.mock.calls.map(
      (llamada) => (llamada[2] as { maxAge: number }).maxAge,
    );
    expect(duraciones).toEqual([28_800, 0, 28_800]);
  });

  it('lee y borra el token', async () => {
    almacen.get.mockReturnValue({ name: NOMBRE_COOKIE_SESION, value: 'tok' });

    await expect(leerToken()).resolves.toBe('tok');
    await borrarToken();

    expect(almacen.get).toHaveBeenCalledWith(NOMBRE_COOKIE_SESION);
    expect(almacen.delete).toHaveBeenCalledWith(NOMBRE_COOKIE_SESION);
  });

  it('sin cookie no hay token', async () => {
    almacen.get.mockReturnValue(undefined);
    await expect(leerToken()).resolves.toBeUndefined();
  });
});
