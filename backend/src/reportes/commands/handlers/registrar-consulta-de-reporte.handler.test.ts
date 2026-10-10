import { Logger } from '@nestjs/common';
import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import { ReporteConsulta } from '../../entities/reporte-consulta.entity';
import type { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { RED } from '../../services/datos-de-prueba';
import { RegistrarConsultaDeReporte } from '../impl/registrar-consulta-de-reporte.command';
import { RegistrarConsultaDeReporteHandler } from './registrar-consulta-de-reporte.handler';

interface Preparado {
  handler: RegistrarConsultaDeReporteHandler;
  constancias: RepositorioSimulado<ReporteConsulta>;
  obtenerRed: jest.Mock;
  unidad: UnidadDeTrabajoSimulada;
}

function preparar(): Preparado {
  const unidad = new UnidadDeTrabajoSimulada();
  const constancias = unidad.registrar(ReporteConsulta);
  constancias.save.mockImplementation((datos) =>
    Promise.resolve({ ...datos, id: 42 } as ReporteConsulta),
  );
  const obtenerRed = jest.fn().mockResolvedValue(RED);
  const handler = new RegistrarConsultaDeReporteHandler(unidad, {
    obtenerRed,
  } as unknown as RedAdapter);
  return { handler, constancias, obtenerRed, unidad };
}

describe('RegistrarConsultaDeReporteHandler', () => {
  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('guarda la constancia con quién la pidió, el tipo y los filtros, y devuelve su id', async () => {
    const { handler, constancias } = preparar();

    const id = await handler.execute(new RegistrarConsultaDeReporte('LINEAS', { lineaId: 1 }, 9));

    expect(id).toBe(42);
    expect(constancias.save.mock.calls).toEqual([
      [{ usuarioId: 9, tipoReporte: 'LINEAS', filtrosJson: '{"lineaId":1}' }],
    ]);
  });

  it('guarda los filtros en JSON canónico sin los vacíos', async () => {
    const { handler, constancias } = preparar();

    await handler.execute(
      new RegistrarConsultaDeReporte(
        'BUSES',
        { municipalidadId: 1, estacionId: 2, lineaId: undefined },
        9,
      ),
    );

    expect(constancias.save.mock.calls[0]?.[0]).toMatchObject({
      filtrosJson: '{"estacionId":2,"municipalidadId":1}',
    });
  });

  it('sin filtros guarda null y no consulta la red', async () => {
    const { handler, constancias, obtenerRed } = preparar();

    await handler.execute(new RegistrarConsultaDeReporte('ESTACIONES', {}, 9));

    expect(constancias.save.mock.calls[0]?.[0]).toMatchObject({ filtrosJson: null });
    expect(obtenerRed).not.toHaveBeenCalled();
  });

  it.each(['estaciones', 'PILOTOS', ''])(
    'rechaza el tipo %p y no deja constancia',
    async (tipo) => {
      const { handler, constancias, unidad } = preparar();

      await expect(
        handler.execute(new RegistrarConsultaDeReporte(tipo, {}, 9)),
      ).rejects.toMatchObject({ codigo: 'TIPO_DE_REPORTE_INVALIDO', tipo: 'REGLA_NEGOCIO' });
      expect(constancias.save.mock.calls).toHaveLength(0);
      expect(unidad.ejecuciones).toBe(0);
    },
  );

  it.each([
    ['lineaId', { lineaId: 99 }, 'LINEA_NO_EXISTE'],
    ['estacionId', { estacionId: 99 }, 'ESTACION_NO_EXISTE'],
    ['municipalidadId', { municipalidadId: 99 }, 'MUNICIPALIDAD_NO_EXISTE'],
  ])('rechaza un %s inexistente y no deja constancia', async (_campo, filtros, codigo) => {
    const { handler, constancias } = preparar();

    await expect(
      handler.execute(new RegistrarConsultaDeReporte('LINEAS', filtros, 9)),
    ).rejects.toMatchObject({ codigo, tipo: 'REGLA_NEGOCIO' });
    expect(constancias.save.mock.calls).toHaveLength(0);
  });

  it('acepta un filtro válido junto a uno inexistente solo si ambos existen', async () => {
    const { handler, constancias } = preparar();

    await expect(
      handler.execute(new RegistrarConsultaDeReporte('LINEAS', { lineaId: 1, estacionId: 99 }, 9)),
    ).rejects.toMatchObject({ codigo: 'ESTACION_NO_EXISTE' });
    expect(constancias.save.mock.calls).toHaveLength(0);
  });

  it('si la constancia no se puede guardar, responde CONSTANCIA_NO_REGISTRADA sin detalles de la base', async () => {
    const { handler, constancias } = preparar();
    constancias.save.mockRejectedValue(new Error('connection terminated: relation "x"'));

    const error: unknown = await handler
      .execute(new RegistrarConsultaDeReporte('LINEAS', {}, 9))
      .catch((causa: unknown) => causa);

    expect(error).toMatchObject({ codigo: 'CONSTANCIA_NO_REGISTRADA' });
    expect((error as Error).message).not.toContain('relation');
  });
});
