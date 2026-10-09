import {
  editarGuardiaEnBackend,
  listarGuardias,
  listarOpcionesDeGuardia,
  obtenerGuardia,
} from './guardias';
import { listarOpcionesDeLinea } from './lineas';
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

const GUARDIA = {
  id: 7,
  nombre: 'Ana Pérez',
  dpi: '1234 56789 0101',
  telefono: null,
  asignaciones: 0,
  sinAsignacion: true,
};

describe('datos de guardias', () => {
  it('lista con la búsqueda y la página en la URL', async () => {
    const pagina = { elementos: [GUARDIA], total: 1, pagina: 1, tamano: 25 };
    responder(pagina);

    const resultado = await listarGuardias({ busqueda: 'ana', pagina: 3 });

    expect(resultado).toEqual({ ok: true, datos: pagina });
    expect(Object.fromEntries(new URL(llamada().url).searchParams)).toEqual({
      busqueda: 'ana',
      pagina: '3',
      tamano: '25',
    });
  });

  it('una respuesta que no cumple el esquema es RESPUESTA_INVALIDA', async () => {
    responder({ ...GUARDIA, asignaciones: 'muchas' });

    const resultado = await obtenerGuardia(7);

    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'RESPUESTA_INVALIDA' } });
  });

  it('las opciones traen id, nombre y DPI', async () => {
    responder([{ id: 7, nombre: 'Ana Pérez', dpi: '1234 56789 0101', telefono: '5555-5555' }]);

    const resultado = await listarOpcionesDeGuardia();

    expect(resultado).toEqual({
      ok: true,
      datos: [{ id: 7, nombre: 'Ana Pérez', dpi: '1234 56789 0101' }],
    });
    expect(llamada().url).toBe('http://backend.prueba:3001/guardias/opciones');
  });

  it('al editar sin teléfono envía nulo para quitarlo', async () => {
    responder(undefined, 204);

    await editarGuardiaEnBackend(7, { nombre: 'Ana Pérez', dpi: '1234 56789 0101' });

    expect(llamada().opciones).toMatchObject({
      method: 'PATCH',
      body: JSON.stringify({ nombre: 'Ana Pérez', dpi: '1234 56789 0101', telefono: null }),
    });
  });

  it('las líneas del filtro solo traen id, código y nombre', async () => {
    responder({
      elementos: [{ id: 1, codigo: 'L1', nombre: 'Línea 1', estado: 'ACTIVA' }],
      total: 1,
      pagina: 1,
      tamano: 100,
    });

    const resultado = await listarOpcionesDeLinea();

    expect(resultado).toEqual({ ok: true, datos: [{ id: 1, codigo: 'L1', nombre: 'Línea 1' }] });
    expect(new URL(llamada().url).searchParams.get('tamano')).toBe('100');
  });
});
