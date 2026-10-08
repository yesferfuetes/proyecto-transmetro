import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { leerToken } from '@/shared/lib/sesion/cookie';
import {
  editarEstacionEnBackend,
  listarEstaciones,
  listarOpcionesDeEstacion,
  obtenerEstacion,
} from './estaciones';

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

const ESTACION = {
  id: 3,
  codigo: 'E3',
  nombre: 'Trébol',
  municipalidad: { id: 1, nombre: 'Guatemala' },
  tieneParqueo: true,
  lineas: [{ id: 1, codigo: 'L1' }],
  sinLinea: false,
};

describe('datos de estaciones', () => {
  it('lista con los filtros en la URL', async () => {
    const pagina = { elementos: [ESTACION], total: 1, pagina: 1, tamano: 25 };
    responder(pagina);

    const resultado = await listarEstaciones({
      lineaId: 1,
      tieneParqueo: 'true',
      busqueda: 'tré',
      pagina: 2,
    });

    expect(resultado).toEqual({ ok: true, datos: pagina });
    const url = new URL(llamada().url);
    expect(url.pathname).toBe('/estaciones');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      lineaId: '1',
      tieneParqueo: 'true',
      busqueda: 'tré',
      pagina: '2',
      tamano: '25',
    });
  });

  it('una respuesta que no cumple el esquema es RESPUESTA_INVALIDA', async () => {
    responder({ ...ESTACION, latitud: 'catorce' });

    const resultado = await obtenerEstacion(3);

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'RESPUESTA_INVALIDA' } });
  });

  it('las opciones del buscador solo traen id, código y nombre', async () => {
    responder([{ id: 1, codigo: 'E1', nombre: 'Uno', municipalidadId: 4 }]);

    const resultado = await listarOpcionesDeEstacion();

    expect(resultado).toEqual({ ok: true, datos: [{ id: 1, codigo: 'E1', nombre: 'Uno' }] });
    expect(llamada().url).toBe('http://backend.prueba:3001/estaciones/opciones');
  });

  it('si el backend no responde a tiempo devuelve TIEMPO_AGOTADO', async () => {
    fetchSimulado.mockRejectedValue(new DOMException('tarde', 'TimeoutError'));

    const resultado = await listarOpcionesDeEstacion();

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'TIEMPO_AGOTADO' } });
  });

  it('al editar sin coordenadas envía las dos nulas para quitarlas', async () => {
    responder(undefined, 204);

    await editarEstacionEnBackend(3, {
      nombre: 'Trébol',
      municipalidadId: 1,
      tieneParqueo: false,
      latitud: undefined,
      longitud: undefined,
    });

    expect(llamada().opciones).toMatchObject({
      method: 'PATCH',
      body: JSON.stringify({
        nombre: 'Trébol',
        municipalidadId: 1,
        tieneParqueo: false,
        latitud: null,
        longitud: null,
      }),
    });
  });
});
