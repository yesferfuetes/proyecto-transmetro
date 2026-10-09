import type { EventBus } from '@nestjs/cqrs';
import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import { Bus } from '../../entities/bus.entity';
import { Parqueo } from '../../entities/parqueo.entity';
import { ParqueoEliminado } from '../../events/eventos-de-flota';
import { EliminarParqueo } from '../impl/eliminar-parqueo.command';
import { EliminarParqueoHandler } from './eliminar-parqueo.handler';

function preparar(
  parqueo: Partial<Parqueo> | null,
  buses = 0,
): {
  handler: EliminarParqueoHandler;
  parqueos: RepositorioSimulado<Parqueo>;
  publicar: jest.Mock;
} {
  const unidad = new UnidadDeTrabajoSimulada();
  const parqueos = unidad.registrar(Parqueo);
  parqueos.findOne.mockResolvedValue(parqueo as Parqueo | null);
  unidad.registrar(Bus).countBy.mockResolvedValue(buses);
  const publicar = jest.fn();
  const handler = new EliminarParqueoHandler(unidad, { publish: publicar } as unknown as EventBus);
  return { handler, parqueos, publicar };
}

const PARQUEO = { id: 4, codigo: 'P1', capacidadVehiculos: 10 };

describe('EliminarParqueoHandler', () => {
  it('elimina un parqueo vacío, lo bloquea y avisa', async () => {
    const { handler, parqueos, publicar } = preparar(PARQUEO, 0);

    await handler.execute(new EliminarParqueo(4, 9));

    expect(parqueos.delete.mock.calls).toContainEqual([{ id: 4 }]);
    expect(parqueos.findOne.mock.calls).toContainEqual([
      {
        where: { id: 4 },
        lock: { mode: 'pessimistic_write' },
      },
    ]);
    expect(publicar).toHaveBeenCalledWith(new ParqueoEliminado(9, 4, 'P1'));
  });

  it('rechaza eliminar un parqueo que guarda buses', async () => {
    const { handler, parqueos, publicar } = preparar(PARQUEO, 2);

    await expect(handler.execute(new EliminarParqueo(4, 9))).rejects.toMatchObject({
      codigo: 'PARQUEO_CON_BUSES',
    });
    expect(parqueos.delete.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('rechaza un parqueo inexistente', async () => {
    const { handler } = preparar(null);

    await expect(handler.execute(new EliminarParqueo(9, 9))).rejects.toMatchObject({
      codigo: 'PARQUEO_NO_EXISTE',
    });
  });
});
