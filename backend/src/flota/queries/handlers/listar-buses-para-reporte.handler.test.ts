import type { Repository } from 'typeorm';
import type { Bus } from '../../entities/bus.entity';
import { ListarBusesParaReporteHandler } from './listar-buses-para-reporte.handler';

function bus(id: number, lineaId: number | null): Bus {
  return {
    id,
    placa: `TM-000${id}`,
    capacidadMax: 120,
    lineaId,
    parqueoId: 4,
    estado: 'ACTIVO',
    parqueo: { id: 4, estacionId: 9, codigo: 'P1', capacidadVehiculos: 30 },
  };
}

describe('ListarBusesParaReporteHandler', () => {
  it('devuelve todos los buses por placa, con línea (o sin ella) y su parqueo', async () => {
    const find = jest.fn().mockResolvedValue([bus(1, 2), bus(2, null)]);
    const handler = new ListarBusesParaReporteHandler({ find } as unknown as Repository<Bus>);

    const buses = await handler.execute();

    expect(buses).toEqual([
      {
        id: 1,
        placa: 'TM-0001',
        capacidadMax: 120,
        lineaId: 2,
        estado: 'ACTIVO',
        parqueo: { id: 4, codigo: 'P1', estacionId: 9 },
      },
      {
        id: 2,
        placa: 'TM-0002',
        capacidadMax: 120,
        lineaId: null,
        estado: 'ACTIVO',
        parqueo: { id: 4, codigo: 'P1', estacionId: 9 },
      },
    ]);
    expect(find).toHaveBeenCalledWith({ relations: { parqueo: true }, order: { placa: 'ASC' } });
  });
});
