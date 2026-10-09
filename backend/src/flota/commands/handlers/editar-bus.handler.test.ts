import type { EventBus } from '@nestjs/cqrs';
import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import { Bus } from '../../entities/bus.entity';
import { BusEditado } from '../../events/eventos-de-flota';
import { EditarBus } from '../impl/editar-bus.command';
import { EditarBusHandler } from './editar-bus.handler';

function preparar(bus: Partial<Bus> | null): {
  handler: EditarBusHandler;
  buses: RepositorioSimulado<Bus>;
  publicar: jest.Mock;
} {
  const unidad = new UnidadDeTrabajoSimulada();
  const buses = unidad.registrar(Bus);
  buses.findOne.mockResolvedValue(bus as Bus | null);
  const publicar = jest.fn();
  const handler = new EditarBusHandler(unidad, { publish: publicar } as unknown as EventBus);
  return { handler, buses, publicar };
}

describe('EditarBusHandler', () => {
  it('cambia la capacidad, bloquea el bus y avisa', async () => {
    const { handler, buses, publicar } = preparar({ id: 1, capacidadMax: 100 });

    await handler.execute(new EditarBus(1, 160, 9));

    expect(buses.update.mock.calls).toContainEqual([{ id: 1 }, { capacidadMax: 160 }]);
    expect(buses.findOne.mock.calls).toContainEqual([
      {
        where: { id: 1 },
        lock: { mode: 'pessimistic_write' },
      },
    ]);
    expect(publicar).toHaveBeenCalledWith(new BusEditado(9, 1, 160));
  });

  it.each([0, 301, 2.5])('rechaza la capacidad %p', async (capacidad) => {
    const { handler, buses } = preparar({ id: 1, capacidadMax: 100 });

    await expect(handler.execute(new EditarBus(1, capacidad, 9))).rejects.toMatchObject({
      codigo: 'CAPACIDAD_INVALIDA',
    });
    expect(buses.update.mock.calls).toHaveLength(0);
  });

  it('rechaza un bus inexistente', async () => {
    const { handler } = preparar(null);

    await expect(handler.execute(new EditarBus(9, 100, 9))).rejects.toMatchObject({
      codigo: 'BUS_NO_EXISTE',
    });
  });

  it('no escribe ni avisa si la capacidad es la misma', async () => {
    const { handler, buses, publicar } = preparar({ id: 1, capacidadMax: 100 });

    await handler.execute(new EditarBus(1, 100, 9));

    expect(buses.update.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });
});
