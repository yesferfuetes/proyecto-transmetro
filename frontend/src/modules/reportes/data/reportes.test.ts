import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { leerToken } from '@/shared/lib/sesion/cookie';
import { fetchSimulado, llamada, responder } from './aparato-de-prueba';
import {
  leerExportacion,
  leerReporteDeBuses,
  leerReporteDeEstaciones,
  leerReporteDeLineas,
  registrarConsulta,
} from './reportes';

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

const CONSULTA = {
  id: 7,
  tipo: 'LINEAS',
  filtros: { municipalidad: { id: 2, nombre: 'Mixco' } },
  fechaHora: '2026-10-09T16:30:00.000Z',
};
const MUNICIPALIDAD = { id: 1, nombre: 'Guatemala' };
const LINEA = {
  id: 1,
  codigo: '1',
  nombre: 'Línea 1',
  municipalidad: MUNICIPALIDAD,
  estado: 'ACTIVA',
  estaciones: 14,
  longitudKm: 12.5,
  buses: 20,
  minimo: 15,
  maximo: 30,
  estadoDeFlota: 'completa',
};
const pagina = (elementos: unknown[], extra = {}): object => ({
  consulta: CONSULTA,
  elementos,
  total: elementos.length,
  pagina: 1,
  tamano: 25,
  ...extra,
});

describe('datos de reportes', () => {
  it('registra la consulta con POST y devuelve su id', async () => {
    responder({ id: 7 }, 201);
    const solicitud = { tipo: 'LINEAS', municipalidadId: 2 } as const;
    await expect(registrarConsulta(solicitud)).resolves.toEqual({ ok: true, datos: { id: 7 } });
    const { url, opciones } = llamada();
    expect(url).toBe('http://backend.prueba:3001/reportes/consultas');
    expect(opciones).toMatchObject({ method: 'POST', body: JSON.stringify(solicitud) });
    expect(opciones?.headers).toMatchObject({ Authorization: 'Bearer tok' });
  });

  it('lee el reporte de líneas de una constancia con su página y el tiempo de espera', async () => {
    responder(pagina([LINEA]));
    const resultado = await leerReporteDeLineas(7, 2);
    expect(resultado).toMatchObject({ ok: true, datos: { total: 1, elementos: [{ id: 1 }] } });
    const { url, opciones } = llamada();
    expect(url).toBe('http://backend.prueba:3001/reportes/consultas/7/lineas?pagina=2&tamano=25');
    expect(opciones?.signal).toBeInstanceOf(AbortSignal);
  });

  it('lee el reporte de estaciones', async () => {
    const estacion = {
      id: 3,
      codigo: 'E3',
      nombre: 'Trébol',
      municipalidad: MUNICIPALIDAD,
      lineas: [{ id: 1, codigo: '1', nombre: 'Línea 1' }],
      tieneParqueo: true,
    };
    responder(pagina([estacion]));
    await expect(leerReporteDeEstaciones(7, 1)).resolves.toMatchObject({ ok: true });
    expect(llamada().url).toContain('/reportes/consultas/7/estaciones?');
  });

  it('lee el reporte de buses con los buses sin línea y los grupos', async () => {
    const parqueo = { id: 1, codigo: 'P1', estacion: { id: 4, nombre: 'Centra Sur' } };
    const buses = [
      { id: 1, placa: 'TM-1', capacidadMax: 160, estado: 'ACTIVO', linea: null, parqueo },
    ];
    responder(pagina(buses, { grupos: [{ linea: null, buses: 1 }] }));
    const resultado = await leerReporteDeBuses(7, 1);
    expect(resultado).toMatchObject({ ok: true, datos: { grupos: [{ linea: null, buses: 1 }] } });
  });

  it('lee la exportación completa de una constancia', async () => {
    const archivo = { nombreDeArchivo: 'reporte-lineas.csv', contenido: 'Código\r\n1' };
    responder(archivo);
    await expect(leerExportacion(7)).resolves.toEqual({ ok: true, datos: archivo });
    expect(llamada().url).toBe('http://backend.prueba:3001/reportes/consultas/7/exportacion');
  });

  it('una respuesta que no cumple el esquema es RESPUESTA_INVALIDA', async () => {
    responder(pagina([{ ...LINEA, estadoDeFlota: 'rota' }]));
    const resultado = await leerReporteDeLineas(7, 1);
    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'RESPUESTA_INVALIDA' } });
  });

  it('si el backend no responde a tiempo devuelve TIEMPO_AGOTADO', async () => {
    fetchSimulado.mockRejectedValue(new DOMException('tarde', 'TimeoutError'));
    const resultado = await leerReporteDeEstaciones(7, 1);
    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'TIEMPO_AGOTADO' } });
  });

  it('devuelve el error de negocio del backend', async () => {
    responder(
      { codigo: 'CONSULTA_NO_EXISTE', mensaje: 'La consulta no existe.', detalles: [] },
      404,
    );
    const resultado = await leerReporteDeBuses(99, 1);
    expect(resultado).toMatchObject({ ok: false, error: { codigo: 'CONSULTA_NO_EXISTE' } });
  });
});
