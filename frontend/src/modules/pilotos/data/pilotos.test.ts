import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { leerToken } from '@/shared/lib/sesion/cookie';
import { obtenerSesion } from '@/shared/lib/sesion/sesion';
import type { Rol } from '@/shared/schemas/sesion';
import {
  cambiarBusEnBackend,
  editarPilotoEnBackend,
  listarOpciones,
  listarPilotos,
  obtenerPiloto,
  registrarPilotoEnBackend,
} from './pilotos';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn() }));
vi.mock('@/shared/lib/sesion/sesion', () => ({ obtenerSesion: vi.fn() }));

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

function comoRol(rol: Rol): void {
  vi.mocked(obtenerSesion).mockResolvedValue({
    id: 1,
    nombre: 'Persona de prueba',
    correo: 'prueba@transmetro.test',
    rol,
    estacion: null,
  });
}

beforeEach(() => {
  vi.stubEnv('BACKEND_URL', 'http://backend.prueba:3001');
  vi.stubGlobal('fetch', fetchSimulado);
  vi.mocked(leerToken).mockResolvedValue('tok');
  comoRol('SUPERVISOR_MUNICIPAL');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const REDUCIDO = {
  id: 1,
  nombre: 'Ana López',
  telefono: '5555-1234',
  bus: { id: 2, placa: 'TM-0001', estado: 'ACTIVO' },
  linea: { id: 3, codigo: '1', nombre: 'Línea 1' },
  busDeBaja: false,
};
const COMPLETO = {
  ...REDUCIDO,
  dpi: '1234 56789 0101',
  direccionResidencia: 'Zona 1',
  correo: null,
  historialEducativo: 'Bachiller',
};
const PAGINA = { elementos: [{ ...REDUCIDO, dpi: COMPLETO.dpi }], total: 1, pagina: 1, tamano: 25 };

describe('datos de pilotos', () => {
  it('lista con los filtros en la URL, el token y 25 filas por página', async () => {
    responder(PAGINA);
    const resultado = await listarPilotos({ lineaId: 3, busqueda: 'Ana', pagina: 2 });
    expect(resultado).toEqual({ ok: true, datos: { vista: 'completa', pagina: PAGINA } });
    const { url, opciones } = llamada();
    expect(url).toBe(
      'http://backend.prueba:3001/pilotos?lineaId=3&busqueda=Ana&pagina=2&tamano=25',
    );
    expect(opciones?.headers).toMatchObject({ Authorization: 'Bearer tok' });
    expect(opciones?.signal).toBeInstanceOf(AbortSignal);
  });

  it('pide los pilotos sin bus con sinBus', async () => {
    responder(PAGINA);
    await listarPilotos({ sinBus: '1', pagina: 1 });
    expect(llamada().url).toContain('sinBus=true');
  });

  it('el administrador recibe la vista completa', async () => {
    comoRol('ADMINISTRADOR');
    responder(COMPLETO);
    await expect(obtenerPiloto(1)).resolves.toEqual({
      ok: true,
      datos: { vista: 'completa', piloto: COMPLETO },
    });
    expect(llamada().url).toBe('http://backend.prueba:3001/pilotos/1');
  });

  it('el operador usa el esquema reducido y acepta la ficha sin datos personales', async () => {
    comoRol('OPERADOR_ESTACION');
    responder({ elementos: [REDUCIDO], total: 1, pagina: 1, tamano: 25 });
    await expect(listarPilotos({ pagina: 1 })).resolves.toMatchObject({
      ok: true,
      datos: { vista: 'reducida' },
    });
    fetchSimulado.mockClear();
    responder(REDUCIDO);
    await expect(obtenerPiloto(1)).resolves.toEqual({
      ok: true,
      datos: { vista: 'reducida', piloto: REDUCIDO },
    });
  });

  it('el operador rechaza un listado que trae el DPI', async () => {
    comoRol('OPERADOR_ESTACION');
    responder(PAGINA);
    await expect(listarPilotos({ pagina: 1 })).resolves.toMatchObject({
      ok: false,
      error: { codigo: 'RESPUESTA_INVALIDA' },
    });
  });

  it('el operador rechaza una ficha que trae la dirección y el historial', async () => {
    comoRol('OPERADOR_ESTACION');
    responder(COMPLETO);
    await expect(obtenerPiloto(1)).resolves.toMatchObject({
      ok: false,
      error: { codigo: 'RESPUESTA_INVALIDA' },
    });
  });

  it('una respuesta que no cumple el esquema es RESPUESTA_INVALIDA', async () => {
    responder({ ...PAGINA, elementos: [{ ...PAGINA.elementos[0], busDeBaja: 'no' }] });
    await expect(listarPilotos({ pagina: 1 })).resolves.toMatchObject({
      ok: false,
      error: { codigo: 'RESPUESTA_INVALIDA' },
    });
  });

  it('si el backend no responde a tiempo devuelve TIEMPO_AGOTADO', async () => {
    fetchSimulado.mockRejectedValue(new DOMException('tarde', 'TimeoutError'));
    await expect(obtenerPiloto(1)).resolves.toMatchObject({
      ok: false,
      error: { codigo: 'TIEMPO_AGOTADO' },
    });
  });

  it('obtiene las opciones de buses y líneas', async () => {
    const opciones = {
      buses: [{ id: 2, placa: 'TM-0001', linea: null, pilotos: 1 }],
      lineas: [{ id: 3, codigo: '1', nombre: 'Línea 1' }],
    };
    responder(opciones);
    await expect(listarOpciones()).resolves.toEqual({ ok: true, datos: opciones });
    expect(llamada().url).toBe('http://backend.prueba:3001/pilotos/opciones');
  });

  it('registra con POST y devuelve el id', async () => {
    responder({ id: 9 }, 201);
    const datos = {
      nombre: 'Ana',
      dpi: '1234567890101',
      direccionResidencia: 'Zona 1',
      telefono: '55551234',
      historialEducativo: 'Bachiller',
    };
    await expect(registrarPilotoEnBackend(datos)).resolves.toEqual({ ok: true, datos: { id: 9 } });
    expect(llamada().opciones).toMatchObject({ method: 'POST', body: JSON.stringify(datos) });
  });

  it.each([
    [
      'edita',
      () =>
        editarPilotoEnBackend(1, {
          nombre: 'Ana',
          dpi: '1234567890101',
          direccionResidencia: 'Z1',
          telefono: '55551234',
          historialEducativo: 'B',
        }),
      'PATCH',
      '/pilotos/1',
    ],
    ['cambia de bus', () => cambiarBusEnBackend(1, { busId: null }), 'PUT', '/pilotos/1/bus'],
  ])('%s sin cuerpo de respuesta', async (_nombre, escribir, metodo, ruta) => {
    responder(undefined, 204);
    await expect(escribir()).resolves.toEqual({ ok: true, datos: undefined });
    expect(llamada().url).toBe(`http://backend.prueba:3001${ruta}`);
    expect(llamada().opciones).toMatchObject({ method: metodo });
  });

  it('devuelve el error de negocio del backend', async () => {
    responder({ codigo: 'BUS_DE_BAJA', mensaje: 'El bus está de baja.', detalles: [] }, 422);
    await expect(cambiarBusEnBackend(1, { busId: 2 })).resolves.toMatchObject({
      ok: false,
      error: { codigo: 'BUS_DE_BAJA' },
    });
  });
});
