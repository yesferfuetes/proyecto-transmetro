import { aCsv, nombreDeArchivo, sello } from './csv';
import { armarExportacion } from './exportacion';
import { BUSES, FLOTA, RED } from './datos-de-prueba';

describe('aCsv', () => {
  it('empieza con BOM, separa con comas y termina cada fila con \\r\\n', () => {
    const csv = aCsv(['A', 'B'], [[1, 'x']]);

    expect(csv).toBe('﻿A,B\r\n1,x\r\n');
  });

  it('pone comillas a lo que trae comas, comillas o saltos de línea', () => {
    const csv = aCsv(['Texto'], [['uno, dos'], ['dice "hola"'], ['a\nb']]);

    expect(csv).toBe('﻿Texto\r\n"uno, dos"\r\n"dice ""hola"""\r\n"a\nb"\r\n');
  });

  it('conserva acentos y deja vacío lo nulo', () => {
    expect(aCsv(['Línea', 'Longitud'], [['Ñ-1', null]])).toBe('﻿Línea,Longitud\r\nÑ-1,\r\n');
  });
});

describe('nombre de archivo', () => {
  it('usa la hora de Guatemala (UTC−6)', () => {
    const ahora = new Date('2026-10-09T03:07:00Z');

    expect(sello(ahora)).toBe('20261008-2107');
    expect(nombreDeArchivo('LINEAS', ahora)).toBe('reporte-lineas-20261008-2107.csv');
  });
});

describe('armarExportacion', () => {
  const fecha = new Date('2026-10-09T15:30:00Z');

  it('exporta todas las filas del reporte de buses, no solo una página', () => {
    const { nombreDeArchivo: nombre, contenido } = armarExportacion(
      'BUSES',
      RED,
      BUSES,
      FLOTA,
      {},
      fecha,
    );

    const filas = contenido.split('\r\n').filter((f) => f !== '');
    expect(nombre).toBe('reporte-buses-20261009-0930.csv');
    expect(filas).toHaveLength(BUSES.length + 1);
    expect(filas[0]).toBe('﻿Línea,Placa,Capacidad,Estado,Parqueo,Estación del parqueo');
    expect(filas.at(-1)).toContain('Sin línea,B-04');
  });

  it('exporta el reporte de líneas con encabezados en español', () => {
    const { contenido } = armarExportacion('LINEAS', RED, BUSES, FLOTA, { lineaId: 1 }, fecha);

    expect(contenido.split('\r\n')[1]).toBe('L1,Línea L1,Guatemala,ACTIVA,3,4.5,2,2,6,completa');
  });

  it('exporta el reporte de estaciones con sus líneas', () => {
    const { contenido } = armarExportacion(
      'ESTACIONES',
      RED,
      BUSES,
      FLOTA,
      { estacionId: 2 },
      fecha,
    );

    expect(contenido.split('\r\n')[1]).toBe('E2,Estación E2,Guatemala,L1; L2,No');
  });

  it('un reporte vacío trae solo los encabezados', () => {
    const { contenido } = armarExportacion(
      'LINEAS',
      RED,
      BUSES,
      FLOTA,
      { lineaId: 1, estacionId: 3 },
      fecha,
    );

    expect(contenido.split('\r\n').filter((f) => f !== '')).toHaveLength(1);
  });
});
