import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { leerToken } from '@/shared/lib/sesion/cookie';
import { fetchSimulado, llamada, responder } from './aparato-de-prueba';
import { listarBitacora } from './bitacora';
import { listarOpciones } from './opciones';

vi.mock('@/shared/lib/sesion/cookie', () => ({ leerToken: vi.fn() }));

beforeEach(() => {
  vi.stubEnv('BACKEND_URL', 'http://backend.prueba:3001');
  vi.stubGlobal('fetch', fetchSimulado);
  vi.mocked(leerToken).mockResolvedValue('tok');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const CONSTANCIA = {
  id: 1,
  usuario: { id: 2, nombre: 'Ana Supervisora', correo: 'ana@transmetro.test' },
  tipo: 'BUSES',
  filtros: null,
  fechaHora: '2026-10-09T16:30:00.000Z',
};

describe('datos de la bitácora', () => {
  it('lista con los filtros en la URL y 25 filas por página', async () => {
    const pagina = { elementos: [CONSTANCIA], total: 1, pagina: 2, tamano: 25 };
    responder(pagina);
    const resultado = await listarBitacora({
      usuarioId: 2,
      tipo: 'BUSES',
      desde: '2026-10-01',
      hasta: '2026-10-09',
      pagina: 2,
    });
    expect(resultado).toMatchObject({ ok: true, datos: { total: 1 } });
    const { url, opciones } = llamada();
    expect(url).toBe(
      'http://backend.prueba:3001/reportes/bitacora?usuarioId=2&tipo=BUSES&desde=2026-10-01&hasta=2026-10-09&pagina=2&tamano=25',
    );
    expect(opciones?.headers).toMatchObject({ Authorization: 'Bearer tok' });
    expect(opciones?.signal).toBeInstanceOf(AbortSignal);
  });

  it('una constancia sin filtros llega con los filtros vacíos', async () => {
    responder({ elementos: [CONSTANCIA], total: 1, pagina: 1, tamano: 25 });
    const resultado = await listarBitacora({ pagina: 1 });
    expect(resultado).toMatchObject({ ok: true, datos: { elementos: [{ filtros: {} }] } });
    expect(llamada().url).toBe('http://backend.prueba:3001/reportes/bitacora?pagina=1&tamano=25');
  });

  it('devuelve RANGO_DE_FECHAS_INVALIDO del backend tal cual', async () => {
    responder(
      { codigo: 'RANGO_DE_FECHAS_INVALIDO', mensaje: 'El rango no es válido.', detalles: [] },
      422,
    );
    const resultado = await listarBitacora({ desde: '2026-10-09', hasta: '2026-10-01', pagina: 1 });
    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'RANGO_DE_FECHAS_INVALIDO' } });
  });

  it('una respuesta que no cumple el esquema es RESPUESTA_INVALIDA', async () => {
    responder({ elementos: [{ ...CONSTANCIA, tipo: 'PILOTOS' }], total: 1, pagina: 1, tamano: 25 });
    const resultado = await listarBitacora({ pagina: 1 });
    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'RESPUESTA_INVALIDA' } });
  });

  it('si el backend no responde a tiempo devuelve TIEMPO_AGOTADO', async () => {
    fetchSimulado.mockRejectedValue(new DOMException('tarde', 'TimeoutError'));
    const resultado = await listarBitacora({ pagina: 1 });
    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'TIEMPO_AGOTADO' } });
  });

  it('lee las opciones de los formularios', async () => {
    const opciones = {
      lineas: [{ id: 1, codigo: '1', nombre: 'Línea 1' }],
      estaciones: [{ id: 3, codigo: 'E3', nombre: 'Trébol' }],
      municipalidades: [{ id: 1, nombre: 'Guatemala' }],
      usuarios: [{ id: 2, nombre: 'Ana', correo: 'ana@transmetro.test' }],
    };
    responder(opciones);
    await expect(listarOpciones()).resolves.toEqual({ ok: true, datos: opciones });
    expect(llamada().url).toBe('http://backend.prueba:3001/reportes/opciones');
  });

  it('unas opciones incompletas son RESPUESTA_INVALIDA', async () => {
    responder({ lineas: [] });
    await expect(listarOpciones()).resolves.toMatchObject({
      ok: false,
      error: { codigo: 'RESPUESTA_INVALIDA' },
    });
  });
});
