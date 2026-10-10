import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { leerToken } from '@/shared/lib/sesion/cookie';
import {
  atenderEnBackend,
  listarAlertas,
  registrarDemandaEnBackend,
  registrarOcupacionEnBackend,
} from './alertas';

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

const ALERTA = {
  id: 4,
  tipo: 'SOBRECUPO',
  aviso: 'Hace falta otra unidad en esta estación.',
  porcentaje: 150,
  fechaHora: '2026-10-09T15:00:00.000Z',
  atendida: false,
  estacion: { id: 3, codigo: 'E3', nombre: 'Trébol' },
  bus: { id: 7, placa: 'TM-0007' },
  linea: { id: 2, codigo: '12', nombre: 'Línea 12' },
  atendidaPor: null,
};
const PAGINA = { elementos: [ALERTA], total: 1, pagina: 1, tamano: 25 };

describe('datos de alertas', () => {
  it('lista con los filtros en la URL, el token y 25 filas por página', async () => {
    responder(PAGINA);
    const resultado = await listarAlertas({
      estado: 'pendiente',
      tipo: 'SOBRECUPO',
      estacion: 3,
      linea: 2,
      pagina: 2,
    });
    expect(resultado).toEqual({ ok: true, datos: PAGINA });
    const { url, opciones } = llamada();
    expect(url).toBe(
      'http://backend.prueba:3001/alertas?estado=pendiente&tipo=SOBRECUPO&estacionId=3&lineaId=2&pagina=2&tamano=25',
    );
    expect(opciones?.headers).toMatchObject({ Authorization: 'Bearer tok' });
    expect(opciones?.signal).toBeInstanceOf(AbortSignal);
  });

  it('una respuesta que no cumple el esquema es RESPUESTA_INVALIDA', async () => {
    responder({ ...PAGINA, elementos: [{ ...ALERTA, tipo: 'OTRO' }] });
    const resultado = await listarAlertas({ pagina: 1 });
    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'RESPUESTA_INVALIDA' } });
  });

  it('si el backend no responde a tiempo devuelve TIEMPO_AGOTADO', async () => {
    fetchSimulado.mockRejectedValue(new DOMException('tarde', 'TimeoutError'));
    const resultado = await listarAlertas({ pagina: 1 });
    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'TIEMPO_AGOTADO' } });
  });

  it.each([
    ['la demanda', registrarDemandaEnBackend, '/alertas/demandas'],
    ['la ocupación', registrarOcupacionEnBackend, '/alertas/ocupaciones'],
  ])('registra %s con POST y devuelve el id de la alerta', async (_n, registrar, ruta) => {
    responder({ alertaId: 8 }, 201);
    const lectura = { estacionId: 3, busId: 7, pasajeros: 150 };
    await expect(registrar(lectura)).resolves.toEqual({ ok: true, datos: { alertaId: 8 } });
    expect(llamada().url).toBe(`http://backend.prueba:3001${ruta}`);
    expect(llamada().opciones).toMatchObject({ method: 'POST', body: JSON.stringify(lectura) });
  });

  it('acepta alertaId nulo cuando no corresponde alerta', async () => {
    responder({ alertaId: null }, 201);
    const lectura = { estacionId: 3, busId: 7, pasajeros: 10 };
    await expect(registrarDemandaEnBackend(lectura)).resolves.toEqual({
      ok: true,
      datos: { alertaId: null },
    });
  });

  it('atiende con PUT y sin cuerpo de respuesta', async () => {
    responder(undefined, 204);
    await expect(atenderEnBackend(4)).resolves.toEqual({ ok: true, datos: undefined });
    expect(llamada().url).toBe('http://backend.prueba:3001/alertas/4/atencion');
    expect(llamada().opciones).toMatchObject({ method: 'PUT' });
  });

  it('devuelve el error de negocio del backend', async () => {
    responder({ codigo: 'ALERTA_YA_ATENDIDA', mensaje: 'Ya fue atendida.', detalles: [] }, 409);
    const resultado = await atenderEnBackend(4);
    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'ALERTA_YA_ATENDIDA' } });
  });
});
