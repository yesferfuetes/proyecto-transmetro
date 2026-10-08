import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { leerToken } from '@/shared/lib/sesion/cookie';
import {
  cambiarEstadoDeLineaEnBackend,
  definirRecorridoEnBackend,
  idsDeLineasDeEstacion,
  listarLineas,
  obtenerLinea,
  registrarLineaEnBackend,
} from './lineas';

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

const LINEA = {
  id: 1,
  codigo: 'L1',
  nombre: 'Línea 1',
  municipalidad: { id: 1, nombre: 'Guatemala' },
  estado: 'ACTIVA',
  numeroDeEstaciones: 3,
  longitudKm: 2,
};

const PAGINA = { elementos: [LINEA], total: 1, pagina: 1, tamano: 25 };

describe('datos de líneas', () => {
  it('lista con los filtros en la URL, el token y 25 filas por página', async () => {
    responder(PAGINA);

    const resultado = await listarLineas({ municipalidadId: 2, estado: 'ACTIVA', pagina: 3 });

    expect(resultado).toEqual({ ok: true, datos: PAGINA });
    const { url, opciones } = llamada();
    expect(url).toBe(
      'http://backend.prueba:3001/lineas?municipalidadId=2&estado=ACTIVA&pagina=3&tamano=25',
    );
    expect(opciones?.headers).toMatchObject({ Authorization: 'Bearer tok' });
    expect(opciones?.signal).toBeInstanceOf(AbortSignal);
  });

  it('una respuesta que no cumple el esquema es RESPUESTA_INVALIDA', async () => {
    responder({ ...PAGINA, elementos: [{ ...LINEA, estado: 'CERRADA' }] });

    const resultado = await listarLineas({});

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'RESPUESTA_INVALIDA' } });
  });

  it('si el backend no responde a tiempo devuelve TIEMPO_AGOTADO', async () => {
    fetchSimulado.mockRejectedValue(new DOMException('tarde', 'TimeoutError'));

    const resultado = await obtenerLinea(1);

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'TIEMPO_AGOTADO' } });
  });

  it('obtiene el detalle con su recorrido y distancias', async () => {
    const { numeroDeEstaciones: _sinUso, ...base } = LINEA;
    const detalle = {
      ...base,
      creadoEn: '2026-10-01T10:00:00Z',
      recorrido: [
        {
          posicion: 1,
          estacion: { id: 1, codigo: 'E1', nombre: 'Uno', municipalidadNombre: 'Guatemala' },
          distanciaSiguienteKm: 1.2,
          distanciaAcumuladaKm: 0,
        },
      ],
    };
    responder(detalle);

    await expect(obtenerLinea(1)).resolves.toEqual({ ok: true, datos: detalle });
    expect(llamada().url).toBe('http://backend.prueba:3001/lineas/1');
  });

  it('da los ids de las líneas que pasan por una estación', async () => {
    responder({ ...PAGINA, elementos: [LINEA, { ...LINEA, id: 5, codigo: 'L5' }], total: 2 });

    await expect(idsDeLineasDeEstacion(3)).resolves.toEqual({ ok: true, datos: [1, 5] });
    expect(llamada().url).toContain('estacionId=3');
  });

  it('registra con POST y devuelve el id', async () => {
    responder({ id: 20 }, 201);
    const datos = {
      codigo: 'L20',
      nombre: 'Línea 20',
      municipalidadId: 1,
      estado: 'EN_CONSTRUCCION',
    } as const;

    await expect(registrarLineaEnBackend(datos)).resolves.toEqual({ ok: true, datos: { id: 20 } });
    expect(llamada().opciones).toMatchObject({ method: 'POST', body: JSON.stringify(datos) });
  });

  it('cambia el estado y define el recorrido con PUT sin cuerpo de respuesta', async () => {
    responder(undefined, 204);
    await expect(cambiarEstadoDeLineaEnBackend(1, { estado: 'INACTIVA' })).resolves.toEqual({
      ok: true,
      datos: undefined,
    });
    expect(llamada().url).toBe('http://backend.prueba:3001/lineas/1/estado');

    fetchSimulado.mockClear();
    responder(undefined, 204);
    const recorrido = { paradas: [{ estacionId: 1, distanciaSiguienteKm: null }] };
    await definirRecorridoEnBackend(1, recorrido);
    expect(llamada()).toMatchObject({
      url: 'http://backend.prueba:3001/lineas/1/recorrido',
      opciones: { method: 'PUT', body: JSON.stringify(recorrido) },
    });
  });

  it('devuelve el error de negocio del backend', async () => {
    responder(
      { codigo: 'RECORRIDO_INSUFICIENTE', mensaje: 'Faltan estaciones.', detalles: [] },
      422,
    );

    const resultado = await cambiarEstadoDeLineaEnBackend(1, { estado: 'ACTIVA' });

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'RECORRIDO_INSUFICIENTE' } });
  });
});
