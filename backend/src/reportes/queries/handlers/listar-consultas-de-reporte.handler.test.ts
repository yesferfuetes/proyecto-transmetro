import { And, FindManyOptions, LessThan, MoreThanOrEqual, Repository } from 'typeorm';
import { ReporteConsulta } from '../../entities/reporte-consulta.entity';
import type { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import type { UsuariosAdapter } from '../../infrastructure/adapters/usuarios.adapter';
import { RED } from '../../services/datos-de-prueba';
import { ListarConsultasDeReporte } from '../impl/listar-consultas-de-reporte.query';
import { ListarConsultasDeReporteHandler } from './listar-consultas-de-reporte.handler';
import { constancia } from './pruebas-de-consulta';

const PAGINA = { pagina: 1, tamano: 25 };

function preparar(
  filas: ReporteConsulta[] = [],
  total = filas.length,
): {
  handler: ListarConsultasDeReporteHandler;
  buscar: jest.Mock<Promise<[ReporteConsulta[], number]>, [FindManyOptions<ReporteConsulta>]>;
  obtenerUsuarios: jest.Mock;
} {
  const buscar = jest
    .fn<Promise<[ReporteConsulta[], number]>, [FindManyOptions<ReporteConsulta>]>()
    .mockResolvedValue([filas, total]);
  const obtenerUsuarios = jest.fn().mockResolvedValue([
    { id: 9, nombre: 'Ana Supervisora', correo: 'ana@example.com' },
    { id: 10, nombre: 'Beto Admin', correo: 'beto@example.com' },
  ]);
  const handler = new ListarConsultasDeReporteHandler(
    { findAndCount: buscar } as unknown as Repository<ReporteConsulta>,
    { obtenerRed: jest.fn().mockResolvedValue(RED) } as unknown as RedAdapter,
    { obtenerUsuarios } as unknown as UsuariosAdapter,
  );
  return { handler, buscar, obtenerUsuarios };
}

describe('ListarConsultasDeReporteHandler', () => {
  it('pide de la más reciente a la más antigua, paginado', async () => {
    const { handler, buscar } = preparar();

    await handler.execute(new ListarConsultasDeReporte({}, { pagina: 3, tamano: 10 }));

    expect(buscar).toHaveBeenCalledWith({
      where: {},
      order: { fechaHora: 'DESC', id: 'DESC' },
      skip: 20,
      take: 10,
    });
  });

  it('resuelve el nombre del usuario y los nombres de los filtros', async () => {
    const { handler, obtenerUsuarios } = preparar(
      [
        constancia({ id: 2, usuarioId: 10, tipoReporte: 'BUSES', filtrosJson: '{"lineaId":1}' }),
        constancia({ id: 1, usuarioId: 9, tipoReporte: 'ESTACIONES' }),
      ],
      12,
    );

    const pagina = await handler.execute(new ListarConsultasDeReporte({}, PAGINA));

    expect(obtenerUsuarios).toHaveBeenCalledWith([10, 9]);
    expect(pagina.total).toBe(12);
    expect(pagina.elementos[0]).toMatchObject({
      id: 2,
      tipo: 'BUSES',
      usuario: { id: 10, nombre: 'Beto Admin' },
      filtros: { linea: { id: 1, codigo: 'L1' } },
    });
    expect(pagina.elementos[1]?.filtros).toEqual({});
  });

  it('sin constancias no pregunta por usuarios', async () => {
    const { handler, obtenerUsuarios } = preparar([]);

    const pagina = await handler.execute(new ListarConsultasDeReporte({}, PAGINA));

    expect(pagina.elementos).toEqual([]);
    expect(obtenerUsuarios).not.toHaveBeenCalled();
  });

  it('filtra por usuario y por tipo', async () => {
    const { handler, buscar } = preparar();

    await handler.execute(new ListarConsultasDeReporte({ usuarioId: 9, tipo: 'LINEAS' }, PAGINA));

    expect(buscar.mock.calls[0]?.[0]).toMatchObject({
      where: { usuarioId: 9, tipoReporte: 'LINEAS' },
    });
  });

  it('filtra por rango en días de Guatemala, con el fin inclusivo', async () => {
    const { handler, buscar } = preparar();

    await handler.execute(
      new ListarConsultasDeReporte({ desde: '2026-10-08', hasta: '2026-10-09' }, PAGINA),
    );

    expect(buscar.mock.calls[0]?.[0]).toMatchObject({
      where: {
        fechaHora: And(
          MoreThanOrEqual(new Date('2026-10-08T06:00:00Z')),
          LessThan(new Date('2026-10-10T06:00:00Z')),
        ),
      },
    });
  });

  it('con un solo extremo usa solo ese límite', async () => {
    const { handler, buscar } = preparar();

    await handler.execute(new ListarConsultasDeReporte({ desde: '2026-10-08' }, PAGINA));
    await handler.execute(new ListarConsultasDeReporte({ hasta: '2026-10-08' }, PAGINA));

    expect(buscar.mock.calls[0]?.[0]).toMatchObject({
      where: { fechaHora: MoreThanOrEqual(new Date('2026-10-08T06:00:00Z')) },
    });
    expect(buscar.mock.calls[1]?.[0]).toMatchObject({
      where: { fechaHora: LessThan(new Date('2026-10-09T06:00:00Z')) },
    });
  });

  it('rechaza el rango con inicio posterior al fin sin consultar nada', async () => {
    const { handler, buscar } = preparar();

    await expect(
      handler.execute(
        new ListarConsultasDeReporte({ desde: '2026-10-09', hasta: '2026-10-08' }, PAGINA),
      ),
    ).rejects.toMatchObject({ codigo: 'RANGO_DE_FECHAS_INVALIDO' });
    expect(buscar).not.toHaveBeenCalled();
  });

  it('rechaza un tipo desconocido', async () => {
    const { handler, buscar } = preparar();

    await expect(
      handler.execute(new ListarConsultasDeReporte({ tipo: 'PILOTOS' }, PAGINA)),
    ).rejects.toMatchObject({ codigo: 'TIPO_DE_REPORTE_INVALIDO' });
    expect(buscar).not.toHaveBeenCalled();
  });
});
