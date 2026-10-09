import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { leerToken } from '@/shared/lib/sesion/cookie';
import {
  editarParqueoEnBackend,
  eliminarParqueoEnBackend,
  listarParqueos,
  obtenerParqueo,
  registrarParqueoEnBackend,
} from './parqueos';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn() }));

const fetchSimulado = vi.fn<typeof fetch>();

function responder(cuerpo: unknown, estado = 200): void {
  fetchSimulado.mockResolvedValue(
    new Response(cuerpo === undefined ? null : JSON.stringify(cuerpo), { status: estado }),
  );
}

function llamada(): { url: string; opciones: RequestInit | undefined } {
  const [url, opciones] = fetchSimulado.mock.calls[0] ?? [];
  return { url: url instanceof Request ? url.url : (url?.toString() ?? ''), opciones };
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

const PARQUEO = {
  id: 3,
  codigo: 'P1',
  capacidadVehiculos: 30,
  buses: 12,
  estacion: { id: 4, codigo: 'E4', nombre: 'Centra Sur' },
};

describe('datos de parqueos', () => {
  it('lista todos los parqueos con su ocupación', async () => {
    responder([PARQUEO]);
    await expect(listarParqueos()).resolves.toEqual({ ok: true, datos: [PARQUEO] });
    expect(llamada().url).toBe('http://backend.prueba:3001/flota/parqueos');
  });

  it('una respuesta que no cumple el esquema es RESPUESTA_INVALIDA', async () => {
    responder([{ ...PARQUEO, capacidadVehiculos: 'treinta' }]);
    await expect(listarParqueos()).resolves.toMatchObject({
      ok: false,
      error: { codigo: 'RESPUESTA_INVALIDA' },
    });
  });

  it('si el backend no responde a tiempo devuelve TIEMPO_AGOTADO', async () => {
    fetchSimulado.mockRejectedValue(new DOMException('tarde', 'TimeoutError'));
    await expect(obtenerParqueo(3)).resolves.toMatchObject({
      ok: false,
      error: { codigo: 'TIEMPO_AGOTADO' },
    });
  });

  it('obtiene un parqueo por id', async () => {
    responder(PARQUEO);
    await expect(obtenerParqueo(3)).resolves.toEqual({ ok: true, datos: PARQUEO });
    expect(llamada().url).toBe('http://backend.prueba:3001/flota/parqueos/3');
  });

  it('registra con POST, edita con PATCH y elimina con DELETE', async () => {
    responder({ id: 5 }, 201);
    const datos = { estacionId: 4, codigo: 'P2', capacidadVehiculos: 10 };
    await expect(registrarParqueoEnBackend(datos)).resolves.toEqual({ ok: true, datos: { id: 5 } });
    expect(llamada().opciones).toMatchObject({ method: 'POST', body: JSON.stringify(datos) });

    fetchSimulado.mockClear();
    responder(undefined, 204);
    await editarParqueoEnBackend(3, { capacidadVehiculos: 40 });
    expect(llamada().opciones).toMatchObject({ method: 'PATCH' });

    fetchSimulado.mockClear();
    responder(undefined, 204);
    await expect(eliminarParqueoEnBackend(3)).resolves.toEqual({ ok: true, datos: undefined });
    expect(llamada()).toMatchObject({
      url: 'http://backend.prueba:3001/flota/parqueos/3',
      opciones: { method: 'DELETE' },
    });
  });

  it('devuelve el error de negocio del backend', async () => {
    responder({ codigo: 'PARQUEO_CON_BUSES', mensaje: 'Guarda buses.', detalles: [] }, 422);
    await expect(eliminarParqueoEnBackend(3)).resolves.toMatchObject({
      ok: false,
      error: { codigo: 'PARQUEO_CON_BUSES' },
    });
  });
});
