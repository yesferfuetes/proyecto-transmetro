import type { Repository } from 'typeorm';
import type { ReporteConsulta } from '../../entities/reporte-consulta.entity';
import { ObtenerReporteDeLineas } from '../impl/obtener-reporte-de-lineas.query';
import { ObtenerReporteDeLineasHandler } from './obtener-reporte-de-lineas.handler';
import { constancia, FECHA, simular } from './pruebas-de-consulta';

function manejador(guardada: ReporteConsulta | null): {
  handler: ObtenerReporteDeLineasHandler;
  busquedas: unknown[];
} {
  const { constancias, red, flota, busquedas } = simular(guardada);
  return {
    handler: new ObtenerReporteDeLineasHandler(
      constancias as unknown as Repository<ReporteConsulta>,
      red,
      flota,
    ),
    busquedas,
  };
}

const PAGINA = { pagina: 1, tamano: 25 };

describe('ObtenerReporteDeLineasHandler', () => {
  it('arma el reporte con la red y la flota, y la consulta con la fecha de generación', async () => {
    const { handler, busquedas } = manejador(constancia());

    const reporte = await handler.execute(new ObtenerReporteDeLineas(7, 9, PAGINA));

    expect(busquedas).toEqual([{ id: 7, usuarioId: 9 }]);
    expect(reporte.elementos.map((l) => l.codigo)).toEqual(['L1', 'L2', 'L10']);
    expect(reporte).toMatchObject({ total: 3, pagina: 1, tamano: 25 });
    expect(reporte.consulta).toEqual({ id: 7, tipo: 'LINEAS', filtros: {}, fechaHora: FECHA });
  });

  it('aplica los filtros guardados en la constancia, con sus nombres', async () => {
    const { handler } = manejador(constancia({ filtrosJson: '{"municipalidadId":1}' }));

    const reporte = await handler.execute(new ObtenerReporteDeLineas(7, 9, PAGINA));

    expect(reporte.elementos.map((l) => l.codigo)).toEqual(['L1', 'L10']);
    expect(reporte.consulta.filtros).toEqual({ municipalidad: { id: 1, nombre: 'Guatemala' } });
  });

  it('pagina, pero el total es el del conjunto filtrado', async () => {
    const { handler } = manejador(constancia());

    const reporte = await handler.execute(
      new ObtenerReporteDeLineas(7, 9, { pagina: 2, tamano: 2 }),
    );

    expect(reporte.elementos.map((l) => l.codigo)).toEqual(['L10']);
    expect(reporte.total).toBe(3);
  });

  it('con filtros que no dejan nada entrega el reporte vacío, sin error', async () => {
    const { handler } = manejador(constancia({ filtrosJson: '{"lineaId":1,"estacionId":3}' }));

    const reporte = await handler.execute(new ObtenerReporteDeLineas(7, 9, PAGINA));

    expect(reporte).toMatchObject({ elementos: [], total: 0 });
  });

  it('una constancia ajena o inexistente es CONSULTA_NO_EXISTE', async () => {
    const { handler } = manejador(null);

    await expect(handler.execute(new ObtenerReporteDeLineas(7, 10, PAGINA))).rejects.toMatchObject({
      codigo: 'CONSULTA_NO_EXISTE',
      tipo: 'NO_ENCONTRADO',
    });
  });

  it('una constancia de otro tipo es TIPO_DE_REPORTE_INVALIDO', async () => {
    const { handler } = manejador(constancia({ tipoReporte: 'BUSES' }));

    await expect(handler.execute(new ObtenerReporteDeLineas(7, 9, PAGINA))).rejects.toMatchObject({
      codigo: 'TIPO_DE_REPORTE_INVALIDO',
    });
  });
});
