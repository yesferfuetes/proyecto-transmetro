import { crearRepositorioSimulado } from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import type { BusConParqueo } from '../../../shared/contratos/flota';
import { Piloto } from '../../entities/piloto.entity';
import type { FlotaAdapter } from '../../infrastructure/adapters/flota.adapter';
import type { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { ListarOpcionesDePilotosHandler } from './listar-opciones-de-pilotos.handler';

function bus(id: number, estado: BusConParqueo['estado'], lineaId: number | null): BusConParqueo {
  return {
    id,
    placa: `TM-000${id}`,
    capacidadMax: 100,
    lineaId,
    estado,
    parqueo: { id: 1, codigo: 'P1', estacionId: 1 },
  };
}

function preparar(): {
  handler: ListarOpcionesDePilotosHandler;
  repositorio: ReturnType<typeof crearRepositorioSimulado<Piloto>>;
  obtenerLineas: jest.Mock;
} {
  const repositorio = crearRepositorioSimulado<Piloto>();
  const constructor: Record<string, jest.Mock> = {};
  for (const metodo of ['select', 'addSelect', 'where', 'groupBy']) {
    constructor[metodo] = jest.fn().mockReturnValue(constructor);
  }
  constructor.getRawMany = jest.fn().mockResolvedValue([
    { busId: '1', pilotos: '2' },
    { busId: 2, pilotos: 1 },
  ]);
  (repositorio as unknown as Record<string, jest.Mock>).createQueryBuilder = jest
    .fn()
    .mockReturnValue(constructor);
  const flota = {
    listarBuses: jest
      .fn()
      .mockResolvedValue([
        bus(1, 'ACTIVO', 10),
        bus(2, 'MANTENIMIENTO', 2),
        bus(3, 'BAJA', 7),
        bus(4, 'ACTIVO', null),
      ]),
  };
  const obtenerLineas = jest.fn().mockResolvedValue([
    { id: 10, codigo: 'L10', nombre: 'Línea 10', estado: 'ACTIVA', numeroDeEstaciones: 3 },
    { id: 2, codigo: 'L2', nombre: 'Línea 2', estado: 'ACTIVA', numeroDeEstaciones: 3 },
  ]);
  const handler = new ListarOpcionesDePilotosHandler(
    repositorio,
    flota as unknown as FlotaAdapter,
    { obtenerLineas } as unknown as RedAdapter,
  );
  return { handler, repositorio, obtenerLineas };
}

describe('ListarOpcionesDePilotosHandler', () => {
  it('excluye los buses de baja, cuenta sus pilotos y trae las líneas con buses en orden natural', async () => {
    const { handler, obtenerLineas } = preparar();

    const opciones = await handler.execute();

    expect(opciones.buses.map(({ id }) => id)).toEqual([1, 2, 4]);
    expect(opciones.buses).toEqual([
      { id: 1, placa: 'TM-0001', linea: { id: 10, codigo: 'L10', nombre: 'Línea 10' }, pilotos: 2 },
      { id: 2, placa: 'TM-0002', linea: { id: 2, codigo: 'L2', nombre: 'Línea 2' }, pilotos: 1 },
      { id: 4, placa: 'TM-0004', linea: null, pilotos: 0 },
    ]);
    expect(opciones.lineas.map(({ codigo }) => codigo)).toEqual(['L2', 'L10']);
    expect(obtenerLineas).toHaveBeenCalledWith([10, 2]);
  });

  it('solo lee: no escribe en el repositorio', async () => {
    const { handler, repositorio } = preparar();

    await handler.execute();

    expect(repositorio.save.mock.calls).toHaveLength(0);
    expect(repositorio.update.mock.calls).toHaveLength(0);
    expect(repositorio.insert.mock.calls).toHaveLength(0);
    expect(repositorio.delete.mock.calls).toHaveLength(0);
  });
});
