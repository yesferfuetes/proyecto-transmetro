import type { EventBus } from '@nestjs/cqrs';
import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import { Municipalidad } from '../../entities/municipalidad.entity';
import { MunicipalidadEditada } from '../../events/eventos-de-red';
import { EditarMunicipalidad } from '../impl/editar-municipalidad.command';
import { EditarMunicipalidadHandler } from './editar-municipalidad.handler';

const MIXCO: Municipalidad = {
  id: 2,
  nombre: 'Mixco',
  departamento: 'Guatemala',
  fechaIncorporacion: null,
};

interface Preparado {
  handler: EditarMunicipalidadHandler;
  municipalidades: RepositorioSimulado<Municipalidad>;
  publicar: jest.Mock;
}

function preparar(actual: Municipalidad | null): Preparado {
  const unidad = new UnidadDeTrabajoSimulada();
  const municipalidades = unidad.registrar(Municipalidad);
  municipalidades.findOneBy.mockResolvedValue(actual);
  municipalidades.find.mockResolvedValue([{ id: 1, nombre: 'Guatemala' } as Municipalidad, MIXCO]);
  const publicar = jest.fn();
  const handler = new EditarMunicipalidadHandler(unidad, {
    publish: publicar,
  } as unknown as EventBus);
  return { handler, municipalidades, publicar };
}

describe('EditarMunicipalidadHandler', () => {
  it('guarda solo los campos que cambian y los lista en el evento', async () => {
    const { handler, municipalidades, publicar } = preparar(MIXCO);

    await handler.execute(
      new EditarMunicipalidad(2, { nombre: 'Mixco', fechaIncorporacion: '2026-02-01' }, 9),
    );

    expect(municipalidades.update.mock.calls).toContainEqual([
      { id: 2 },
      { fechaIncorporacion: '2026-02-01' },
    ]);
    expect(publicar).toHaveBeenCalledWith(new MunicipalidadEditada(9, 2, ['fechaIncorporacion']));
  });

  it('permite cambiar las mayúsculas de su propio nombre', async () => {
    const { handler, municipalidades } = preparar(MIXCO);

    await handler.execute(new EditarMunicipalidad(2, { nombre: 'MIXCO' }, 9));

    expect(municipalidades.update.mock.calls).toContainEqual([{ id: 2 }, { nombre: 'MIXCO' }]);
  });

  it('quita el departamento con null', async () => {
    const { handler, municipalidades } = preparar(MIXCO);

    await handler.execute(new EditarMunicipalidad(2, { departamento: null }, 9));

    expect(municipalidades.update.mock.calls).toContainEqual([{ id: 2 }, { departamento: null }]);
  });

  it('rechaza el nombre de otra municipalidad', async () => {
    const { handler, municipalidades, publicar } = preparar(MIXCO);

    await expect(
      handler.execute(new EditarMunicipalidad(2, { nombre: ' guatemala' }, 9)),
    ).rejects.toMatchObject({ codigo: 'MUNICIPALIDAD_DUPLICADA' });
    expect(municipalidades.update.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('rechaza una municipalidad inexistente', async () => {
    const { handler } = preparar(null);

    await expect(
      handler.execute(new EditarMunicipalidad(99, { nombre: 'Otra' }, 9)),
    ).rejects.toMatchObject({ codigo: 'MUNICIPALIDAD_NO_EXISTE', tipo: 'NO_ENCONTRADO' });
  });

  it('no escribe ni avisa si nada cambia', async () => {
    const { handler, municipalidades, publicar } = preparar(MIXCO);

    await handler.execute(new EditarMunicipalidad(2, { departamento: 'Guatemala' }, 9));

    expect(municipalidades.update.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });
});
