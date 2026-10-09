import type { Repository } from 'typeorm';
import type { LineaResumen } from '../../../shared/contratos/red';
import type { Bus } from '../../entities/bus.entity';
import type { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { ListarFlotaPorLineaHandler } from './listar-flota-por-linea.handler';

function linea(
  id: number,
  estaciones: number,
  estado: LineaResumen['estado'] = 'ACTIVA',
): LineaResumen {
  return { id, codigo: `L${id}`, nombre: `Línea ${id}`, estado, numeroDeEstaciones: estaciones };
}

function preparar(
  lineas: LineaResumen[],
  conteos: { lineaId: number; buses: string }[],
): {
  handler: ListarFlotaPorLineaHandler;
  listarLineas: jest.Mock;
} {
  const constructor: object = new Proxy(
    {},
    {
      get: (_objetivo, metodo: string) =>
        metodo === 'getRawMany' ? () => Promise.resolve(conteos) : () => constructor,
    },
  );
  const buses = { createQueryBuilder: () => constructor } as unknown as Repository<Bus>;
  const listarLineas = jest.fn().mockResolvedValue(lineas);
  const red = { listarLineas } as unknown as RedAdapter;
  return { handler: new ListarFlotaPorLineaHandler(buses, red), listarLineas };
}

describe('ListarFlotaPorLineaHandler', () => {
  it('calcula mínimo, máximo y estado de la flota de cada línea con los datos de la red', async () => {
    const { handler, listarLineas } = preparar(
      [linea(1, 3), linea(2, 3), linea(3, 3), linea(4, 3, 'EN_CONSTRUCCION'), linea(5, 0)],
      [
        { lineaId: 1, buses: '7' },
        { lineaId: 2, buses: '2' },
        { lineaId: 3, buses: '3' },
      ],
    );

    const flota = await handler.execute();

    expect(listarLineas).toHaveBeenCalledTimes(1);
    expect(
      flota.map((f) => [f.linea.codigo, f.buses, f.minimo, f.maximo, f.estadoDeFlota]),
    ).toEqual([
      ['L1', 7, 3, 6, 'excedida'],
      ['L2', 2, 3, 6, 'insuficiente'],
      ['L3', 3, 3, 6, 'completa'],
      ['L4', 0, 3, 6, 'insuficiente'],
      ['L5', 0, 0, 0, 'completa'],
    ]);
    expect(flota[3]?.linea).toEqual({
      id: 4,
      codigo: 'L4',
      nombre: 'Línea 4',
      estado: 'EN_CONSTRUCCION',
    });
    expect(flota[0]?.estaciones).toBe(3);
  });
});
