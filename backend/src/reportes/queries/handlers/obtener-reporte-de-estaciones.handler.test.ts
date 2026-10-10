import type { Repository } from 'typeorm';
import type { ReporteConsulta } from '../../entities/reporte-consulta.entity';
import { ObtenerReporteDeEstaciones } from '../impl/obtener-reporte-de-estaciones.query';
import { ObtenerReporteDeEstacionesHandler } from './obtener-reporte-de-estaciones.handler';
import { constancia, simular } from './pruebas-de-consulta';

function manejador(guardada: ReporteConsulta | null): ObtenerReporteDeEstacionesHandler {
  const { constancias, red, flota } = simular(guardada);
  return new ObtenerReporteDeEstacionesHandler(
    constancias as unknown as Repository<ReporteConsulta>,
    red,
    flota,
  );
}

const PAGINA = { pagina: 1, tamano: 25 };

describe('ObtenerReporteDeEstacionesHandler', () => {
  it('trae todas las estaciones con sus líneas y su parqueo, por código', async () => {
    const handler = manejador(constancia({ tipoReporte: 'ESTACIONES' }));

    const reporte = await handler.execute(new ObtenerReporteDeEstaciones(7, 9, PAGINA));

    expect(reporte.elementos.map((e) => e.codigo)).toEqual(['E1', 'E2', 'E3', 'E4', 'E10']);
    expect(reporte.elementos[1]?.lineas.map((l) => l.codigo)).toEqual(['L1', 'L2']);
    expect(reporte.consulta.tipo).toBe('ESTACIONES');
  });

  it('filtra por la municipalidad guardada', async () => {
    const handler = manejador(
      constancia({ tipoReporte: 'ESTACIONES', filtrosJson: '{"municipalidadId":2}' }),
    );

    const reporte = await handler.execute(new ObtenerReporteDeEstaciones(7, 9, PAGINA));

    expect(reporte.elementos.map((e) => e.codigo)).toEqual(['E3', 'E4']);
  });

  it('línea y estación que no se cruzan dan un reporte vacío, no un error', async () => {
    const handler = manejador(
      constancia({ tipoReporte: 'ESTACIONES', filtrosJson: '{"lineaId":1,"estacionId":3}' }),
    );

    const reporte = await handler.execute(new ObtenerReporteDeEstaciones(7, 9, PAGINA));

    expect(reporte).toMatchObject({ elementos: [], total: 0 });
  });

  it('rechaza la constancia ajena y la de otro tipo', async () => {
    await expect(
      manejador(null).execute(new ObtenerReporteDeEstaciones(7, 10, PAGINA)),
    ).rejects.toMatchObject({ codigo: 'CONSULTA_NO_EXISTE' });
    await expect(
      manejador(constancia({ tipoReporte: 'LINEAS' })).execute(
        new ObtenerReporteDeEstaciones(7, 9, PAGINA),
      ),
    ).rejects.toMatchObject({ codigo: 'TIPO_DE_REPORTE_INVALIDO' });
  });
});
