import {
  asignarGuardiaEnBackend,
  listarAccesos,
  listarAccesosDeLinea,
  listarOpcionesDeEstacion,
  obtenerAcceso,
  quitarAsignacionEnBackend,
  registrarAccesoEnBackend,
} from './accesos';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { leerToken } from '@/shared/lib/sesion/cookie';

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

const ESTACION = { id: 3, codigo: 'E3', nombre: 'Trébol' };

describe('datos de accesos', () => {
  it('lista con los filtros en la URL', async () => {
    const pagina = {
      elementos: [
        { estacion: ESTACION, accesos: [{ id: 1, codigo: 'A', nombre: null, guardias: 2 }] },
      ],
      total: 1,
      pagina: 1,
      tamano: 25,
    };
    responder(pagina);

    const resultado = await listarAccesos({
      lineaId: 1,
      estacionId: 3,
      busqueda: 'tré',
      pagina: 2,
    });

    expect(resultado).toEqual({ ok: true, datos: pagina });
    const url = new URL(llamada().url);
    expect(url.pathname).toBe('/accesos');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      lineaId: '1',
      estacionId: '3',
      busqueda: 'tré',
      pagina: '2',
      tamano: '25',
    });
  });

  it('un acceso sin nombre llega como nulo', async () => {
    responder({ id: 1, codigo: 'A', estacion: ESTACION, asignaciones: [] });

    const resultado = await obtenerAcceso(1);

    expect(resultado).toMatchObject({ ok: true, datos: { nombre: null } });
  });

  it('una respuesta que no cumple el esquema es RESPUESTA_INVALIDA', async () => {
    responder({ id: 1, codigo: 'A', estacion: ESTACION, asignaciones: [{ turno: 5 }] });

    const resultado = await obtenerAcceso(1);

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'RESPUESTA_INVALIDA' } });
  });

  it('los accesos de una línea piden la ruta de la línea', async () => {
    responder({ linea: { id: 1, codigo: 'L1', nombre: 'Línea 1' }, estaciones: [] });

    const resultado = await listarAccesosDeLinea(1);

    expect(resultado.ok).toBe(true);
    expect(llamada().url).toBe('http://backend.prueba:3001/accesos/lineas/1');
  });

  it('las opciones de estación solo traen id, código y nombre', async () => {
    responder([{ ...ESTACION, municipalidadId: 4 }]);

    const resultado = await listarOpcionesDeEstacion();

    expect(resultado).toEqual({ ok: true, datos: [ESTACION] });
  });

  it('si el backend no responde a tiempo devuelve TIEMPO_AGOTADO', async () => {
    fetchSimulado.mockRejectedValue(new DOMException('tarde', 'TimeoutError'));

    const resultado = await listarOpcionesDeEstacion();

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'TIEMPO_AGOTADO' } });
  });

  it('al registrar envía el cuerpo y espera el identificador', async () => {
    responder({ id: 8 }, 201);

    const resultado = await registrarAccesoEnBackend({
      estacionId: 3,
      codigo: 'C',
      nombre: undefined,
      guardiaId: 7,
      turno: '06:00-14:00',
    });

    expect(resultado).toEqual({ ok: true, datos: { id: 8 } });
    expect(llamada().opciones).toMatchObject({
      method: 'POST',
      body: JSON.stringify({ estacionId: 3, codigo: 'C', guardiaId: 7, turno: '06:00-14:00' }),
    });
  });

  it('al asignar envía guardia y turno al acceso', async () => {
    responder(undefined, 204);

    await asignarGuardiaEnBackend(5, { guardiaId: 7, turno: '06:00-14:00' });

    expect(llamada().url).toBe('http://backend.prueba:3001/accesos/5/asignaciones');
    expect(llamada().opciones).toMatchObject({ method: 'POST' });
  });

  it('al quitar envía guardia y turno en la consulta de un DELETE', async () => {
    responder(undefined, 204);

    const resultado = await quitarAsignacionEnBackend(5, { guardiaId: 7, turno: '06:00-14:00' });

    expect(resultado).toEqual({ ok: true, datos: undefined });
    const url = new URL(llamada().url);
    expect(url.pathname).toBe('/accesos/5/asignaciones');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      guardiaId: '7',
      turno: '06:00-14:00',
    });
    expect(llamada().opciones).toMatchObject({ method: 'DELETE' });
  });

  it('un error del backend llega con su código', async () => {
    responder({ codigo: 'ACCESO_SIN_GUARDIA', mensaje: 'Asigna otro guardia.', detalles: [] }, 422);

    const resultado = await quitarAsignacionEnBackend(5, { guardiaId: 7, turno: '06:00-14:00' });

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ACCESO_SIN_GUARDIA' } });
  });
});
