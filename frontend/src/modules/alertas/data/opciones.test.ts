import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { leerToken } from '@/shared/lib/sesion/cookie';
import { listarBusesParaLectura, listarOpciones } from './opciones';

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

const BUS = {
  id: 7,
  placa: 'TM-0007',
  capacidadMax: 100,
  linea: { id: 2, codigo: '12', nombre: 'Línea 12' },
};

describe('opciones de alertas', () => {
  it('lista los buses para registrar una lectura', async () => {
    responder([BUS]);
    await expect(listarBusesParaLectura()).resolves.toEqual({ ok: true, datos: [BUS] });
    expect(urlLlamada()).toBe('http://backend.prueba:3001/alertas/opciones/buses');
  });

  it('un bus sin línea es RESPUESTA_INVALIDA', async () => {
    responder([{ ...BUS, linea: null }]);
    await expect(listarBusesParaLectura()).resolves.toMatchObject({
      ok: false,
      error: { codigo: 'RESPUESTA_INVALIDA' },
    });
  });

  it('lista estaciones y líneas para los filtros', async () => {
    const opciones = {
      estaciones: [{ id: 3, codigo: 'E3', nombre: 'Trébol' }],
      lineas: [{ id: 2, codigo: '12', nombre: 'Línea 12' }],
    };
    responder(opciones);
    await expect(listarOpciones()).resolves.toEqual({ ok: true, datos: opciones });
  });

  it('devuelve el error del backend, por ejemplo el acceso denegado', async () => {
    responder({ codigo: 'ACCESO_DENEGADO', mensaje: 'No.', detalles: [] }, 403);
    await expect(listarOpciones()).resolves.toMatchObject({
      ok: false,
      error: { codigo: 'ACCESO_DENEGADO' },
    });
  });

  it('si el backend no responde a tiempo devuelve TIEMPO_AGOTADO', async () => {
    fetchSimulado.mockRejectedValue(new DOMException('tarde', 'TimeoutError'));
    await expect(listarBusesParaLectura()).resolves.toMatchObject({
      ok: false,
      error: { codigo: 'TIEMPO_AGOTADO' },
    });
  });
});
