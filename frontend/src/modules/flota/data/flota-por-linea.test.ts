import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { leerToken } from '@/shared/lib/sesion/cookie';
import { listarFlotaPorLinea } from './flota-por-linea';
import { listarOpcionesDeEstacion, listarOpcionesDeLinea } from './opciones';

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

const FLOTA = {
  linea: { id: 2, codigo: 'L1', nombre: 'Línea 1', estado: 'ACTIVA' },
  estaciones: 3,
  minimo: 3,
  maximo: 6,
  buses: 4,
  estadoDeFlota: 'completa',
};

describe('datos de flota por línea', () => {
  it('lista la flota de cada línea', async () => {
    responder([FLOTA]);
    await expect(listarFlotaPorLinea()).resolves.toEqual({ ok: true, datos: [FLOTA] });
    expect(llamada().url).toBe('http://backend.prueba:3001/flota/lineas');
  });

  it('acepta el estado de la flota en mayúsculas', async () => {
    responder([{ ...FLOTA, estadoDeFlota: 'EXCEDIDA' }]);
    const resultado = await listarFlotaPorLinea();
    expect(resultado).toMatchObject({ ok: true, datos: [{ estadoDeFlota: 'excedida' }] });
  });

  it('un estado de flota desconocido es RESPUESTA_INVALIDA', async () => {
    responder([{ ...FLOTA, estadoDeFlota: 'rota' }]);
    await expect(listarFlotaPorLinea()).resolves.toMatchObject({
      ok: false,
      error: { codigo: 'RESPUESTA_INVALIDA' },
    });
  });

  it('si el backend no responde a tiempo devuelve TIEMPO_AGOTADO', async () => {
    fetchSimulado.mockRejectedValue(new DOMException('tarde', 'TimeoutError'));
    await expect(listarFlotaPorLinea()).resolves.toMatchObject({
      ok: false,
      error: { codigo: 'TIEMPO_AGOTADO' },
    });
  });

  it('pide las líneas que reciben buses con su conteo y su máximo', async () => {
    const opcion = {
      id: 2,
      codigo: 'L1',
      nombre: 'Línea 1',
      estaciones: 3,
      buses: 4,
      maximo: 6,
    };
    responder([opcion]);
    await expect(listarOpcionesDeLinea()).resolves.toEqual({ ok: true, datos: [opcion] });
    expect(llamada().url).toBe('http://backend.prueba:3001/flota/opciones/lineas');
  });

  it('deja solo las estaciones con parqueo', async () => {
    responder([
      { id: 1, codigo: 'E1', nombre: 'Uno', tieneParqueo: true },
      { id: 2, codigo: 'E2', nombre: 'Dos', tieneParqueo: false },
    ]);
    const resultado = await listarOpcionesDeEstacion();
    expect(resultado).toMatchObject({ ok: true, datos: [{ id: 1 }] });
  });
});
