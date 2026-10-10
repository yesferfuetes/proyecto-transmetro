import type { Repository } from 'typeorm';
import type { ReporteConsulta } from '../../entities/reporte-consulta.entity';
import { BUSES } from '../../services/datos-de-prueba';
import { ExportarReporte } from '../impl/exportar-reporte.query';
import { ExportarReporteHandler } from './exportar-reporte.handler';
import { constancia, simular } from './pruebas-de-consulta';

function manejador(guardada: ReporteConsulta | null): ExportarReporteHandler {
  const { constancias, red, flota } = simular(guardada);
  return new ExportarReporteHandler(
    constancias as unknown as Repository<ReporteConsulta>,
    red,
    flota,
  );
}

describe('ExportarReporteHandler', () => {
  it('entrega todas las filas del reporte de buses, no solo la página', async () => {
    const handler = manejador(constancia({ tipoReporte: 'BUSES' }));

    const archivo = await handler.execute(new ExportarReporte(7, 9));

    expect(archivo.nombreDeArchivo).toBe('reporte-buses-20261008-0930.csv');
    expect(archivo.contenido.startsWith('﻿')).toBe(true);
    expect(archivo.contenido.split('\r\n').filter((f) => f !== '')).toHaveLength(BUSES.length + 1);
  });

  it('respeta los filtros de la constancia', async () => {
    const handler = manejador(constancia({ tipoReporte: 'LINEAS', filtrosJson: '{"lineaId":2}' }));

    const archivo = await handler.execute(new ExportarReporte(7, 9));

    expect(archivo.contenido.split('\r\n').filter((f) => f !== '')).toHaveLength(2);
    expect(archivo.contenido).toContain('L2,Línea L2');
  });

  it('una constancia ajena o inexistente es CONSULTA_NO_EXISTE', async () => {
    await expect(manejador(null).execute(new ExportarReporte(7, 10))).rejects.toMatchObject({
      codigo: 'CONSULTA_NO_EXISTE',
    });
  });
});
