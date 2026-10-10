import {
  agruparBuses,
  armarReporteDeBuses,
  armarReporteDeEstaciones,
  armarReporteDeLineas,
} from './armar-reportes';
import { BUSES, FLOTA, RED } from './datos-de-prueba';

describe('armarReporteDeEstaciones', () => {
  it('ordena por código natural y trae las líneas de cada estación por código', () => {
    const filas = armarReporteDeEstaciones(RED, BUSES, {});

    expect(filas.map((f) => f.codigo)).toEqual(['E1', 'E2', 'E3', 'E4', 'E10']);
    const e2 = filas.find((f) => f.codigo === 'E2');
    expect(e2?.lineas.map((l) => l.codigo)).toEqual(['L1', 'L2']);
    expect(e2?.municipalidad).toEqual({ id: 1, nombre: 'Guatemala' });
    expect(filas.map((f) => f.tieneParqueo)).toEqual([true, false, true, false, false]);
  });

  it('con filtro de municipalidad trae solo las estaciones de esa municipalidad', () => {
    const filas = armarReporteDeEstaciones(RED, BUSES, { municipalidadId: 2 });

    expect(filas.map((f) => f.codigo)).toEqual(['E3', 'E4']);
  });

  it('sale vacío sin error cuando los filtros no dejan nada', () => {
    expect(armarReporteDeEstaciones(RED, BUSES, { lineaId: 1, estacionId: 3 })).toEqual([]);
  });
});

describe('armarReporteDeLineas', () => {
  it('ordena por código natural: L1, L2, L10', () => {
    const filas = armarReporteDeLineas(RED, BUSES, FLOTA, {});

    expect(filas.map((f) => f.codigo)).toEqual(['L1', 'L2', 'L10']);
  });

  it('trae estaciones, longitud, buses y estado de la flota de cada línea', () => {
    const [l1, l2, l10] = armarReporteDeLineas(RED, BUSES, FLOTA, {});

    expect(l1).toMatchObject({
      estaciones: 3,
      longitudKm: 4.5,
      buses: 2,
      minimo: 2,
      maximo: 6,
      estadoDeFlota: 'completa',
      municipalidad: { id: 1, nombre: 'Guatemala' },
    });
    expect(l2).toMatchObject({ buses: 2, minimo: 3, estadoDeFlota: 'insuficiente' });
    expect(l10).toMatchObject({ estado: 'EN_CONSTRUCCION', longitudKm: null });
  });

  it('si la flota no trae una línea, cuenta sus buses y no inventa mínimos', () => {
    const filas = armarReporteDeLineas(RED, BUSES, [], { lineaId: 2 });

    expect(filas[0]).toMatchObject({ buses: 2, minimo: 0, maximo: 0 });
  });

  it('una línea y una estación que no se cruzan dan un reporte vacío', () => {
    expect(armarReporteDeLineas(RED, BUSES, FLOTA, { lineaId: 1, estacionId: 3 })).toEqual([]);
  });
});

describe('armarReporteDeBuses', () => {
  it('ordena por código de línea y placa, con los buses sin línea al final', () => {
    const filas = armarReporteDeBuses(RED, BUSES, {});

    expect(filas.map((f) => [f.linea?.codigo ?? null, f.placa])).toEqual([
      ['L1', 'B-01'],
      ['L1', 'B-02'],
      ['L2', 'B-03'],
      ['L2', 'B-05'],
      [null, 'B-04'],
    ]);
  });

  it('trae el parqueo con el nombre de su estación', () => {
    const [primero] = armarReporteDeBuses(RED, BUSES, { lineaId: 1 });

    expect(primero?.parqueo).toEqual({
      id: 1,
      codigo: 'P1',
      estacion: { id: 1, nombre: 'Estación E1' },
    });
  });

  it('con filtro de línea no incluye buses sin línea', () => {
    const filas = armarReporteDeBuses(RED, BUSES, { lineaId: 1 });

    expect(filas.map((f) => f.placa)).toEqual(['B-01', 'B-02']);
  });

  it('los grupos suman el total de buses y los sin línea van al final', () => {
    const filas = armarReporteDeBuses(RED, BUSES, {});
    const grupos = agruparBuses(filas);

    expect(grupos.map((g) => [g.linea?.codigo ?? null, g.buses])).toEqual([
      ['L1', 2],
      ['L2', 2],
      [null, 1],
    ]);
    expect(grupos.reduce((suma, g) => suma + g.buses, 0)).toBe(BUSES.length);
  });

  it('sin buses no hay grupos', () => {
    expect(agruparBuses([])).toEqual([]);
  });
});
