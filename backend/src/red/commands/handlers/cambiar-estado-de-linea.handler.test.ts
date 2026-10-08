import type { EventBus } from '@nestjs/cqrs';
import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import { LineaEstacion } from '../../entities/linea-estacion.entity';
import { Linea } from '../../entities/linea.entity';
import { EstadoDeLineaCambiado } from '../../events/eventos-de-red';
import { CambiarEstadoDeLinea } from '../impl/cambiar-estado-de-linea.command';
import { CambiarEstadoDeLineaHandler } from './cambiar-estado-de-linea.handler';

interface Preparado {
  handler: CambiarEstadoDeLineaHandler;
  lineas: RepositorioSimulado<Linea>;
  publicar: jest.Mock;
}

function preparar(linea: Partial<Linea> | null, estaciones = 0): Preparado {
  const unidad = new UnidadDeTrabajoSimulada();
  const lineas = unidad.registrar(Linea);
  const recorridos = unidad.registrar(LineaEstacion);
  lineas.findOne.mockResolvedValue(linea as Linea | null);
  recorridos.countBy.mockResolvedValue(estaciones);
  const publicar = jest.fn();
  const handler = new CambiarEstadoDeLineaHandler(unidad, {
    publish: publicar,
  } as unknown as EventBus);
  return { handler, lineas, publicar };
}

const EN_CONSTRUCCION = { id: 1, estado: 'EN_CONSTRUCCION' };

describe('CambiarEstadoDeLineaHandler', () => {
  it('rechaza activar una línea con una sola estación y la deja como estaba', async () => {
    const { handler, lineas, publicar } = preparar(EN_CONSTRUCCION, 1);

    await expect(handler.execute(new CambiarEstadoDeLinea(1, 'ACTIVA', 9))).rejects.toMatchObject({
      codigo: 'RECORRIDO_INSUFICIENTE',
    });
    expect(lineas.update.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('activa una línea con tres estaciones', async () => {
    const { handler, lineas, publicar } = preparar(EN_CONSTRUCCION, 3);

    await handler.execute(new CambiarEstadoDeLinea(1, 'ACTIVA', 9));

    expect(lineas.update.mock.calls).toContainEqual([{ id: 1 }, { estado: 'ACTIVA' }]);
    expect(publicar).toHaveBeenCalledWith(
      new EstadoDeLineaCambiado(9, 1, 'EN_CONSTRUCCION', 'ACTIVA'),
    );
  });

  it('pasa a inactiva sin mirar el recorrido', async () => {
    const { handler, lineas } = preparar({ id: 1, estado: 'ACTIVA' }, 0);

    await handler.execute(new CambiarEstadoDeLinea(1, 'INACTIVA', 9));

    expect(lineas.update.mock.calls).toContainEqual([{ id: 1 }, { estado: 'INACTIVA' }]);
  });

  it.each(['CERRADA', 'inactiva'])('rechaza el estado "%s"', async (estado) => {
    const { handler, lineas } = preparar(EN_CONSTRUCCION, 3);

    await expect(handler.execute(new CambiarEstadoDeLinea(1, estado, 9))).rejects.toMatchObject({
      codigo: 'ESTADO_LINEA_INVALIDO',
    });
    expect(lineas.update.mock.calls).toHaveLength(0);
  });

  it('bloquea la fila de la línea', async () => {
    const { handler, lineas } = preparar(EN_CONSTRUCCION, 3);

    await handler.execute(new CambiarEstadoDeLinea(1, 'ACTIVA', 9));

    expect(lineas.findOne.mock.calls).toContainEqual([
      {
        where: { id: 1 },
        lock: { mode: 'pessimistic_write' },
      },
    ]);
  });

  it('rechaza una línea inexistente', async () => {
    const { handler } = preparar(null);

    await expect(handler.execute(new CambiarEstadoDeLinea(9, 'INACTIVA', 9))).rejects.toMatchObject(
      { codigo: 'LINEA_NO_EXISTE' },
    );
  });

  it('no avisa si el estado no cambia', async () => {
    const { handler, lineas, publicar } = preparar({ id: 1, estado: 'INACTIVA' });

    await handler.execute(new CambiarEstadoDeLinea(1, 'INACTIVA', 9));

    expect(lineas.update.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });
});
