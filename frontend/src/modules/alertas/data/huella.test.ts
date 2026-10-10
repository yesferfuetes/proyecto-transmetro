import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { leerToken } from '@/shared/lib/sesion/cookie';
import { leerHuella, leerPendientesDeAlertas } from './huella';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn() }));

const fetchSimulado = vi.fn<typeof fetch>();

function responder(cuerpo: unknown, estado = 200): void {
  fetchSimulado.mockResolvedValue(new Response(JSON.stringify(cuerpo), { status: estado }));
}

function urlLlamada(): string {
  const [url] = fetchSimulado.mock.calls[0] ?? [];
  return url instanceof Request ? url.url : (url?.toString() ?? '');
}

beforeEach(() => {
  vi.stubEnv('BACKEND_URL', 'http://backend.prueba:3001');
  vi.stubGlobal('fetch', fetchSimulado);
  vi.mocked(leerToken).mockResolvedValue('tok');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('huella de alertas', () => {
  it('lee la huella con el token', async () => {
    responder({ pendientes: 2, atendidas: 1, ultimaId: 9 });
    await expect(leerHuella()).resolves.toEqual({
      ok: true,
      datos: { pendientes: 2, atendidas: 1, ultimaId: 9 },
    });
    expect(urlLlamada()).toBe('http://backend.prueba:3001/alertas/huella');
  });

  it('sin alertas llega con ultimaId en 0', async () => {
    responder({ pendientes: 0, atendidas: 0, ultimaId: 0 });
    await expect(leerHuella()).resolves.toMatchObject({ ok: true });
  });

  it('una huella que no cumple el esquema es RESPUESTA_INVALIDA', async () => {
    responder({ pendientes: 'dos' });
    await expect(leerHuella()).resolves.toMatchObject({
      ok: false,
      error: { codigo: 'RESPUESTA_INVALIDA' },
    });
  });

  it('si el backend no responde a tiempo devuelve TIEMPO_AGOTADO', async () => {
    fetchSimulado.mockRejectedValue(new DOMException('tarde', 'TimeoutError'));
    await expect(leerHuella()).resolves.toMatchObject({
      ok: false,
      error: { codigo: 'TIEMPO_AGOTADO' },
    });
  });

  it('entrega el número de pendientes, o nada si no se pudo leer', async () => {
    responder({ pendientes: 4, atendidas: 0, ultimaId: 4 });
    await expect(leerPendientesDeAlertas()).resolves.toBe(4);
    fetchSimulado.mockRejectedValue(new Error('caído'));
    await expect(leerPendientesDeAlertas()).resolves.toBeUndefined();
  });
});
