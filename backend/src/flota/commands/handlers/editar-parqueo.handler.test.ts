import type { EventBus } from '@nestjs/cqrs';
import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import { Bus } from '../../entities/bus.entity';
import { Parqueo } from '../../entities/parqueo.entity';
import { ParqueoEditado } from '../../events/eventos-de-flota';
import { EditarParqueo } from '../impl/editar-parqueo.command';
import { EditarParqueoHandler } from './editar-parqueo.handler';

function preparar(
  parqueo: Partial<Parqueo> | null,
  buses = 0,
): { handler: EditarParqueoHandler; parqueos: RepositorioSimulado<Parqueo>; publicar: jest.Mock } {
  const unidad = new UnidadDeTrabajoSimulada();
  const parqueos = unidad.registrar(Parqueo);
  parqueos.findOne.mockResolvedValue(parqueo as Parqueo | null);
  unidad.registrar(Bus).countBy.mockResolvedValue(buses);
  const publicar = jest.fn();
  const handler = new EditarParqueoHandler(unidad, { publish: publicar } as unknown as EventBus);
  return { handler, parqueos, publicar };
}

const PARQUEO = { id: 4, codigo: 'P1', capacidadVehiculos: 10 };

describe('EditarParqueoHandler', () => {
  it('cambia la capacidad, bloquea el parqueo y avisa', async () => {
    const { handler, parqueos, publicar } = preparar(PARQUEO, 3);

    await handler.execute(new EditarParqueo(4, 20, 9));

    expect(parqueos.update.mock.calls).toContainEqual([{ id: 4 }, { capacidadVehiculos: 20 }]);
    expect(parqueos.findOne.mock.calls).toContainEqual([
      {
        where: { id: 4 },
        lock: { mode: 'pessimistic_write' },
      },
    ]);
    expect(publicar).toHaveBeenCalledWith(new ParqueoEditado(9, 4, 20));
  });

  it('rechaza reducir la capacidad a menos de los 5 buses que guarda', async () => {
    const { handler, parqueos } = preparar(PARQUEO, 5);

    await expect(handler.execute(new EditarParqueo(4, 4, 9))).rejects.toMatchObject({
      codigo: 'CAPACIDAD_PARQUEO_INSUFICIENTE',
    });
    expect(parqueos.update.mock.calls).toHaveLength(0);
  });

  it('acepta reducir la capacidad hasta igualar los buses que guarda', async () => {
    const { handler, parqueos } = preparar(PARQUEO, 5);

    await handler.execute(new EditarParqueo(4, 5, 9));

    expect(parqueos.update.mock.calls).toContainEqual([{ id: 4 }, { capacidadVehiculos: 5 }]);
  });

  it.each([0, -3, 1.5])('rechaza la capacidad %p', async (capacidad) => {
    const { handler, parqueos } = preparar(PARQUEO);

    await expect(handler.execute(new EditarParqueo(4, capacidad, 9))).rejects.toMatchObject({
      codigo: 'CAPACIDAD_INVALIDA',
    });
    expect(parqueos.update.mock.calls).toHaveLength(0);
  });

  it('rechaza un parqueo inexistente', async () => {
    const { handler } = preparar(null);

    await expect(handler.execute(new EditarParqueo(9, 20, 9))).rejects.toMatchObject({
      codigo: 'PARQUEO_NO_EXISTE',
    });
  });

  it('no escribe ni avisa si la capacidad es la misma', async () => {
    const { handler, parqueos, publicar } = preparar(PARQUEO);

    await handler.execute(new EditarParqueo(4, 10, 9));

    expect(parqueos.update.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });
});
