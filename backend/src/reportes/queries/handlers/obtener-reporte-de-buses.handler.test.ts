import type { Repository } from 'typeorm';
import type { ReporteConsulta } from '../../entities/reporte-consulta.entity';
import { BUSES } from '../../services/datos-de-prueba';
import { ObtenerReporteDeBuses } from '../impl/obtener-reporte-de-buses.query';
import { ObtenerReporteDeBusesHandler } from './obtener-reporte-de-buses.handler';
import { constancia, simular } from './pruebas-de-consulta';

function manejador(guardada: ReporteConsulta | null): ObtenerReporteDeBusesHandler {
  const { constancias, red, flota } = simular(guardada);
  return new ObtenerReporteDeBusesHandler(
    constancias as unknown as Repository<ReporteConsulta>,
    red,
    flota,
  );
}

const PAGINA = { pagina: 1, tamano: 25 };

describe('ObtenerReporteDeBusesHandler', () => {
  it('sin filtros cada bus aparece una vez y los grupos suman la flota', async () => {
    const handler = manejador(constancia({ tipoReporte: 'BUSES' }));

    const reporte = await handler.execute(new ObtenerReporteDeBuses(7, 9, PAGINA));

    expect(reporte.elementos).toHaveLength(BUSES.length);
    expect(new Set(reporte.elementos.map((b) => b.id)).size).toBe(BUSES.length);
    expect(reporte.grupos.reduce((suma, g) => suma + g.buses, 0)).toBe(BUSES.length);
    expect(reporte.grupos.at(-1)).toEqual({ linea: null, buses: 1 });
  });

  it('los grupos cuentan el conjunto completo aunque se pida otra página', async () => {
    const handler = manejador(constancia({ tipoReporte: 'BUSES' }));

    const reporte = await handler.execute(
      new ObtenerReporteDeBuses(7, 9, { pagina: 2, tamano: 2 }),
    );

    expect(reporte.elementos.map((b) => b.placa)).toEqual(['B-03', 'B-05']);
    expect(reporte.grupos.map((g) => g.buses)).toEqual([2, 2, 1]);
    expect(reporte.total).toBe(5);
  });

  it('filtrado por línea solo trae sus buses y no el grupo sin línea', async () => {
    const handler = manejador(constancia({ tipoReporte: 'BUSES', filtrosJson: '{"lineaId":1}' }));

    const reporte = await handler.execute(new ObtenerReporteDeBuses(7, 9, PAGINA));

    expect(reporte.elementos.map((b) => b.placa)).toEqual(['B-01', 'B-02']);
    expect(reporte.grupos).toHaveLength(1);
    expect(reporte.grupos.every((g) => g.linea !== null)).toBe(true);
    expect(reporte.consulta.filtros.linea).toEqual({ id: 1, codigo: 'L1', nombre: 'Línea L1' });
  });

  it('vacío sin error cuando los filtros no dejan nada', async () => {
    const handler = manejador(
      constancia({ tipoReporte: 'BUSES', filtrosJson: '{"lineaId":1,"estacionId":3}' }),
    );

    const reporte = await handler.execute(new ObtenerReporteDeBuses(7, 9, PAGINA));

    expect(reporte).toMatchObject({ elementos: [], grupos: [], total: 0 });
  });

  it('rechaza la constancia ajena y la de otro tipo', async () => {
    await expect(
      manejador(null).execute(new ObtenerReporteDeBuses(7, 10, PAGINA)),
    ).rejects.toMatchObject({ codigo: 'CONSULTA_NO_EXISTE' });
    await expect(
      manejador(constancia({ tipoReporte: 'ESTACIONES' })).execute(
        new ObtenerReporteDeBuses(7, 9, PAGINA),
      ),
    ).rejects.toMatchObject({ codigo: 'TIPO_DE_REPORTE_INVALIDO' });
  });
});
