import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { solicitar } from './cliente-backend';

const esquemaLinea = z.object({ codigo: z.string(), nombre: z.string() });
const fetchSimulado = vi.fn<typeof fetch>();

function respuesta(cuerpo: string, estado = 200): Response {
  return new Response(cuerpo, { status: estado });
}

describe('cliente del backend', () => {
  beforeEach(() => {
    vi.stubEnv('BACKEND_URL', 'http://backend.prueba:3001');
    vi.stubGlobal('fetch', fetchSimulado);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('entrega los datos cuando la respuesta cumple el esquema', async () => {
    fetchSimulado.mockResolvedValue(respuesta('{"codigo":"L1","nombre":"Línea 1"}'));

    const resultado = await solicitar({ ruta: '/lineas/1', esquema: esquemaLinea });

    expect(resultado).toEqual({ ok: true, datos: { codigo: 'L1', nombre: 'Línea 1' } });
  });

  it('llama a la URL del backend sin caché y con tiempo de espera', async () => {
    fetchSimulado.mockResolvedValue(respuesta('{"codigo":"L1","nombre":"Línea 1"}'));

    await solicitar({ ruta: '/lineas', esquema: esquemaLinea, metodo: 'POST', cuerpo: { a: 1 } });

    const [url, opciones] = fetchSimulado.mock.calls[0] ?? [];
    expect(url).toEqual(new URL('http://backend.prueba:3001/lineas'));
    expect(opciones).toMatchObject({
      method: 'POST',
      cache: 'no-store',
      body: '{"a":1}',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(opciones?.signal).toBeInstanceOf(AbortSignal);
  });

  it('rechaza una respuesta que no cumple el esquema', async () => {
    fetchSimulado.mockResolvedValue(respuesta('{"codigo":1}'));

    const resultado = await solicitar({ ruta: '/lineas/1', esquema: esquemaLinea });

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'RESPUESTA_INVALIDA' } });
  });

  it('rechaza un cuerpo que no es JSON', async () => {
    fetchSimulado.mockResolvedValue(respuesta('<html>proxy</html>', 502));

    const resultado = await solicitar({ ruta: '/lineas/1', esquema: esquemaLinea });

    expect(resultado).toMatchObject({
      ok: false,
      error: { codigo: 'RESPUESTA_INVALIDA', estado: 502 },
    });
  });

  it('devuelve el error del backend con su código y estado', async () => {
    const sobre = { codigo: 'FLOTA_MAXIMA_EXCEDIDA', mensaje: 'Máximo alcanzado.', detalles: [] };
    fetchSimulado.mockResolvedValue(respuesta(JSON.stringify(sobre), 422));

    const resultado = await solicitar({ ruta: '/buses', esquema: esquemaLinea });

    expect(resultado).toEqual({ ok: false, error: { ...sobre, estado: 422 } });
  });

  it('trata un sobre de error mal formado como respuesta inválida', async () => {
    fetchSimulado.mockResolvedValue(respuesta('{"error":"algo"}', 500));

    const resultado = await solicitar({ ruta: '/buses', esquema: esquemaLinea });

    expect(resultado).toMatchObject({
      ok: false,
      error: { codigo: 'RESPUESTA_INVALIDA', estado: 500 },
    });
  });

  it('informa tiempo agotado cuando el backend no responde a tiempo', async () => {
    fetchSimulado.mockRejectedValue(new DOMException('tiempo', 'TimeoutError'));

    const resultado = await solicitar({ ruta: '/lineas', esquema: esquemaLinea });

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'TIEMPO_AGOTADO', estado: 0 } });
  });

  it('informa que el backend no está disponible ante un fallo de red', async () => {
    fetchSimulado.mockRejectedValue(new TypeError('fetch failed'));

    const resultado = await solicitar({ ruta: '/lineas', esquema: esquemaLinea });

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'BACKEND_NO_DISPONIBLE' } });
  });

  it('acepta una respuesta vacía cuando el esquema lo permite', async () => {
    fetchSimulado.mockResolvedValue(new Response(null, { status: 204 }));

    const resultado = await solicitar({
      ruta: '/buses/1',
      esquema: z.undefined(),
      metodo: 'DELETE',
    });

    expect(resultado).toEqual({ ok: true, datos: undefined });
  });
});
