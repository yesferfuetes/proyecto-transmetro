import type { EventBus } from '@nestjs/cqrs';
import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import { Linea } from '../../entities/linea.entity';
import { Municipalidad } from '../../entities/municipalidad.entity';
import { LineaEditada } from '../../events/eventos-de-red';
import { EditarLinea } from '../impl/editar-linea.command';
import { EditarLineaHandler } from './editar-linea.handler';

const ACTUAL = { id: 1, codigo: 'L1', nombre: 'Línea 1', municipalidadId: 1 } as Linea;

interface Preparado {
  handler: EditarLineaHandler;
  lineas: RepositorioSimulado<Linea>;
  publicar: jest.Mock;
}

function preparar(actual: Linea | null = ACTUAL, municipalidadExiste = true): Preparado {
  const unidad = new UnidadDeTrabajoSimulada();
  const municipalidades = unidad.registrar(Municipalidad);
  const lineas = unidad.registrar(Linea);
  municipalidades.existsBy.mockResolvedValue(municipalidadExiste);
  lineas.findOneBy.mockResolvedValue(actual);
  const publicar = jest.fn();
  const handler = new EditarLineaHandler(unidad, { publish: publicar } as unknown as EventBus);
  return { handler, lineas, publicar };
}

describe('EditarLineaHandler', () => {
  it('edita nombre y municipalidad', async () => {
    const { handler, lineas, publicar } = preparar();

    await handler.execute(new EditarLinea(1, { nombre: 'Centro', municipalidadId: 2 }, 9));

    expect(lineas.update.mock.calls).toContainEqual([
      { id: 1 },
      { nombre: 'Centro', municipalidadId: 2 },
    ]);
    expect(publicar).toHaveBeenCalledWith(new LineaEditada(9, 1, ['nombre', 'municipalidadId']));
  });

  it('rechaza una municipalidad inexistente', async () => {
    const { handler, lineas } = preparar(ACTUAL, false);

    await expect(
      handler.execute(new EditarLinea(1, { municipalidadId: 99 }, 9)),
    ).rejects.toMatchObject({ codigo: 'MUNICIPALIDAD_NO_EXISTE', tipo: 'REGLA_NEGOCIO' });
    expect(lineas.update.mock.calls).toHaveLength(0);
  });

  it('rechaza una línea inexistente', async () => {
    const { handler } = preparar(null);

    await expect(handler.execute(new EditarLinea(99, { nombre: 'X' }, 9))).rejects.toMatchObject({
      codigo: 'LINEA_NO_EXISTE',
    });
  });
});
