import type { EventBus } from '@nestjs/cqrs';
import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import { Acceso } from '../../entities/acceso.entity';
import { AccesoEditado } from '../../events/eventos-de-accesos';
import { EditarAcceso } from '../impl/editar-acceso.command';
import { EditarAccesoHandler } from './editar-acceso.handler';

function preparar(existe = true): {
  handler: EditarAccesoHandler;
  accesos: RepositorioSimulado<Acceso>;
  publicar: jest.Mock;
} {
  const unidad = new UnidadDeTrabajoSimulada();
  const accesos = unidad.registrar(Acceso);
  accesos.existsBy.mockResolvedValue(existe);
  const publicar = jest.fn();
  const handler = new EditarAccesoHandler(unidad, { publish: publicar } as unknown as EventBus);
  return { handler, accesos, publicar };
}

describe('EditarAccesoHandler', () => {
  it('cambia solo el nombre y lo avisa', async () => {
    const { handler, accesos, publicar } = preparar();

    await handler.execute(new EditarAcceso(10, ' Principal ', 9));

    expect(accesos.update.mock.calls).toEqual([[{ id: 10 }, { nombre: 'Principal' }]]);
    expect(publicar).toHaveBeenCalledWith(new AccesoEditado(9, 10, ['nombre']));
  });

  it('un nombre vacío quita el nombre', async () => {
    const { handler, accesos } = preparar();

    await handler.execute(new EditarAcceso(10, '  ', 9));

    expect(accesos.update.mock.calls).toEqual([[{ id: 10 }, { nombre: null }]]);
  });

  it('rechaza un acceso inexistente', async () => {
    const { handler, accesos, publicar } = preparar(false);

    await expect(handler.execute(new EditarAcceso(10, 'Norte', 9))).rejects.toMatchObject({
      codigo: 'ACCESO_NO_EXISTE',
      tipo: 'NO_ENCONTRADO',
    });
    expect(accesos.update.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });
});
