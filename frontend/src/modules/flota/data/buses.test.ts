import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { leerToken } from '@/shared/lib/sesion/cookie';
import {
  asignarLineaEnBackend,
  cambiarEstadoEnBackend,
  cambiarParqueoEnBackend,
  editarBusEnBackend,
  listarBuses,
  obtenerBus,
  registrarBusEnBackend,
} from './buses';

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

const BUS = {
  id: 1,
  placa: 'TM-0001',
  capacidadMax: 160,
  estado: 'ACTIVO',
  linea: { id: 2, codigo: 'L1', nombre: 'Línea 1' },
  parqueo: { id: 3, codigo: 'P1', estacion: { id: 4, nombre: 'Centra Sur' } },
};
const PAGINA = { elementos: [BUS], total: 1, pagina: 1, tamano: 25 };

describe('datos de buses', () => {
  it('lista con los filtros en la URL, el token y 25 filas por página', async () => {
    responder(PAGINA);
    const resultado = await listarBuses({
      lineaId: 2,
      estado: 'ACTIVO',
      busqueda: 'TM',
      pagina: 3,
    });
    expect(resultado).toEqual({ ok: true, datos: PAGINA });
    const { url, opciones } = llamada();
    expect(url).toBe(
      'http://backend.prueba:3001/flota/buses?lineaId=2&estado=ACTIVO&busqueda=TM&pagina=3&tamano=25',
    );
    expect(opciones?.headers).toMatchObject({ Authorization: 'Bearer tok' });
    expect(opciones?.signal).toBeInstanceOf(AbortSignal);
  });

  it('pide los buses sin línea con sinLinea', async () => {
    responder(PAGINA);
    await listarBuses({ sinLinea: '1', pagina: 1 });
    expect(llamada().url).toContain('sinLinea=true');
  });

  it('una respuesta que no cumple el esquema es RESPUESTA_INVALIDA', async () => {
    responder({ ...PAGINA, elementos: [{ ...BUS, estado: 'PERDIDO' }] });
    const resultado = await listarBuses({ pagina: 1 });
    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'RESPUESTA_INVALIDA' } });
  });

  it('si el backend no responde a tiempo devuelve TIEMPO_AGOTADO', async () => {
    fetchSimulado.mockRejectedValue(new DOMException('tarde', 'TimeoutError'));
    const resultado = await obtenerBus(1);
    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'TIEMPO_AGOTADO' } });
  });

  it('obtiene un bus sin línea', async () => {
    const sinLinea = { ...BUS, linea: null };
    responder(sinLinea);
    await expect(obtenerBus(1)).resolves.toEqual({ ok: true, datos: sinLinea });
    expect(llamada().url).toBe('http://backend.prueba:3001/flota/buses/1');
  });

  it('registra con POST y devuelve el id', async () => {
    responder({ id: 9 }, 201);
    const datos = { placa: 'TM-9', capacidadMax: 120, parqueoId: 3, lineaId: null };
    await expect(registrarBusEnBackend(datos)).resolves.toEqual({ ok: true, datos: { id: 9 } });
    expect(llamada().opciones).toMatchObject({ method: 'POST', body: JSON.stringify(datos) });
  });

  it.each([
    ['edita', () => editarBusEnBackend(1, { capacidadMax: 90 }), 'PATCH', '/flota/buses/1'],
    ['asigna', () => asignarLineaEnBackend(1, { lineaId: null }), 'PUT', '/flota/buses/1/linea'],
    [
      'cambia de parqueo',
      () => cambiarParqueoEnBackend(1, { parqueoId: 2 }),
      'PUT',
      '/flota/buses/1/parqueo',
    ],
    [
      'cambia de estado',
      () => cambiarEstadoEnBackend(1, { estado: 'BAJA' }),
      'PUT',
      '/flota/buses/1/estado',
    ],
  ])('%s con %s sin cuerpo de respuesta', async (_nombre, escribir, metodo, ruta) => {
    responder(undefined, 204);
    await expect(escribir()).resolves.toEqual({ ok: true, datos: undefined });
    expect(llamada().url).toBe(`http://backend.prueba:3001${ruta}`);
    expect(llamada().opciones).toMatchObject({ method: metodo });
  });

  it('devuelve el error de negocio del backend', async () => {
    responder(
      {
        codigo: 'FLOTA_MAXIMA_EXCEDIDA',
        mensaje: 'La línea 12 admite como máximo 34 buses.',
        detalles: [],
      },
      422,
    );
    const resultado = await asignarLineaEnBackend(1, { lineaId: 2 });
    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'FLOTA_MAXIMA_EXCEDIDA' } });
  });
});
