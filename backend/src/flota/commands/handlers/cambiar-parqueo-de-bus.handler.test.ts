import type { EventBus } from '@nestjs/cqrs';
import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import { Bus } from '../../entities/bus.entity';
import { Parqueo } from '../../entities/parqueo.entity';
import { ParqueoDeBusCambiado } from '../../events/eventos-de-flota';
import { CambiarParqueoDeBus } from '../impl/cambiar-parqueo-de-bus.command';
import { CambiarParqueoDeBusHandler } from './cambiar-parqueo-de-bus.handler';

interface Preparado {
  handler: CambiarParqueoDeBusHandler;
  buses: RepositorioSimulado<Bus>;
  parqueos: RepositorioSimulado<Parqueo>;
  publicar: jest.Mock;
}

function preparar(
  bus: Partial<Bus> | null,
  destino: Partial<Parqueo> | null,
  busesEnDestino = 0,
): Preparado {
  const unidad = new UnidadDeTrabajoSimulada();
  const buses = unidad.registrar(Bus);
  const parqueos = unidad.registrar(Parqueo);
  buses.findOne.mockResolvedValue(bus as Bus | null);
  buses.countBy.mockResolvedValue(busesEnDestino);
  parqueos.findOne.mockResolvedValue(destino as Parqueo | null);
  const publicar = jest.fn();
  const handler = new CambiarParqueoDeBusHandler(unidad, {
    publish: publicar,
  } as unknown as EventBus);
  return { handler, buses, parqueos, publicar };
}

const BUS = { id: 1, parqueoId: 5, estado: 'ACTIVO' };
const DESTINO = { id: 6, codigo: 'P2', capacidadVehiculos: 3 };

describe('CambiarParqueoDeBusHandler', () => {
  it('cambia el bus a un parqueo con cupo, lo bloquea y avisa', async () => {
    const { handler, buses, parqueos, publicar } = preparar(BUS, DESTINO, 2);

    await handler.execute(new CambiarParqueoDeBus(1, 6, 9));

    expect(buses.update.mock.calls).toContainEqual([{ id: 1 }, { parqueoId: 6 }]);
    expect(parqueos.findOne.mock.calls).toContainEqual([
      {
        where: { id: 6 },
        lock: { mode: 'pessimistic_write' },
      },
    ]);
    expect(publicar).toHaveBeenCalledWith(new ParqueoDeBusCambiado(9, 1, 5, 6));
  });

  it('rechaza un parqueo lleno y el bus conserva el suyo', async () => {
    const { handler, buses, publicar } = preparar(BUS, DESTINO, 3);

    await expect(handler.execute(new CambiarParqueoDeBus(1, 6, 9))).rejects.toMatchObject({
      codigo: 'PARQUEO_LLENO',
    });
    expect(buses.update.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('rechaza un parqueo inexistente', async () => {
    const { handler, buses } = preparar(BUS, null);

    await expect(handler.execute(new CambiarParqueoDeBus(1, 99, 9))).rejects.toMatchObject({
      codigo: 'PARQUEO_NO_EXISTE',
    });
    expect(buses.update.mock.calls).toHaveLength(0);
  });

  it('rechaza un bus inexistente', async () => {
    const { handler } = preparar(null, DESTINO);

    await expect(handler.execute(new CambiarParqueoDeBus(9, 6, 9))).rejects.toMatchObject({
      codigo: 'BUS_NO_EXISTE',
    });
  });

  it('no escribe ni avisa si el parqueo es el mismo', async () => {
    const { handler, buses, publicar } = preparar(BUS, DESTINO);

    await handler.execute(new CambiarParqueoDeBus(1, 5, 9));

    expect(buses.update.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });
});
