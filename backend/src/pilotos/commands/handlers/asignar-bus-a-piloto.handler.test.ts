import type { EventBus } from '@nestjs/cqrs';
import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import type { BusResumen, EstadoDeBus } from '../../../shared/contratos/flota';
import { Piloto } from '../../entities/piloto.entity';
import { BusDePilotoCambiado } from '../../events/eventos-de-pilotos';
import type { FlotaAdapter } from '../../infrastructure/adapters/flota.adapter';
import { AsignarBusAPiloto } from '../impl/asignar-bus-a-piloto.command';
import { AsignarBusAPilotoHandler } from './asignar-bus-a-piloto.handler';

function bus(estado: EstadoDeBus): BusResumen {
  return { id: 8, placa: 'TM-0008', capacidadMax: 100, lineaId: 3, estado };
}

function preparar(
  busActual: number | null,
  piloto = true,
  busNuevo: BusResumen | null = bus('ACTIVO'),
): {
  handler: AsignarBusAPilotoHandler;
  pilotos: RepositorioSimulado<Piloto>;
  publicar: jest.Mock;
  obtenerBus: jest.Mock;
} {
  const unidad = new UnidadDeTrabajoSimulada();
  const pilotos = unidad.registrar(Piloto);
  pilotos.findOneBy.mockResolvedValue(piloto ? ({ id: 7, busId: busActual } as Piloto) : null);
  const obtenerBus = jest.fn().mockResolvedValue(busNuevo);
  const publicar = jest.fn();
  const handler = new AsignarBusAPilotoHandler(
    unidad,
    { obtenerBus } as unknown as FlotaAdapter,
    { publish: publicar } as unknown as EventBus,
  );
  return { handler, pilotos, publicar, obtenerBus };
}

async function codigoRechazado(
  handler: AsignarBusAPilotoHandler,
  comando: AsignarBusAPiloto,
): Promise<string> {
  try {
    await handler.execute(comando);
  } catch (error) {
    return (error as { codigo: string }).codigo;
  }
  return 'NO_RECHAZO';
}

describe('AsignarBusAPilotoHandler', () => {
  it('cambia de bus y avisa con el anterior y el nuevo', async () => {
    const { handler, pilotos, publicar } = preparar(5);

    await handler.execute(new AsignarBusAPiloto(7, 8, 9));

    expect(pilotos.update.mock.calls).toContainEqual([{ id: 7 }, { busId: 8 }]);
    expect(publicar).toHaveBeenCalledWith(new BusDePilotoCambiado(9, 7, 5, 8));
    expect((publicar.mock.calls[0] as [unknown])[0]).toMatchObject({
      accion: 'BUS_DE_PILOTO_CAMBIADO',
      resumen: { anterior: 5, nuevo: 8 },
    });
  });

  it('asigna un bus a un piloto que no tenía', async () => {
    const { handler, publicar } = preparar(null);

    await handler.execute(new AsignarBusAPiloto(7, 8, 9));

    expect(publicar).toHaveBeenCalledWith(new BusDePilotoCambiado(9, 7, null, 8));
  });

  it('quita el bus sin consultar la flota', async () => {
    const { handler, pilotos, publicar, obtenerBus } = preparar(5);

    await handler.execute(new AsignarBusAPiloto(7, null, 9));

    expect(pilotos.update.mock.calls).toContainEqual([{ id: 7 }, { busId: null }]);
    expect(publicar).toHaveBeenCalledWith(new BusDePilotoCambiado(9, 7, 5, null));
    expect(obtenerBus).not.toHaveBeenCalled();
  });

  it('admite un segundo piloto en un bus que ya tiene otro', async () => {
    const { handler, pilotos } = preparar(null);

    await handler.execute(new AsignarBusAPiloto(7, 8, 9));

    expect(pilotos.update.mock.calls).toHaveLength(1);
    expect(pilotos.count.mock.calls).toHaveLength(0);
    expect(pilotos.countBy.mock.calls).toHaveLength(0);
  });

  it('el mismo bus no escribe ni avisa', async () => {
    const { handler, pilotos, publicar, obtenerBus } = preparar(8);

    await handler.execute(new AsignarBusAPiloto(7, 8, 9));

    expect(pilotos.update.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
    expect(obtenerBus).not.toHaveBeenCalled();
  });

  it('seguir sin bus no escribe ni avisa', async () => {
    const { handler, pilotos, publicar } = preparar(null);

    await handler.execute(new AsignarBusAPiloto(7, null, 9));

    expect(pilotos.update.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('admite un bus en mantenimiento', async () => {
    const { handler, pilotos } = preparar(5, true, bus('MANTENIMIENTO'));

    await handler.execute(new AsignarBusAPiloto(7, 8, 9));

    expect(pilotos.update.mock.calls).toHaveLength(1);
  });

  it('rechaza un bus de baja y no cambia nada', async () => {
    const { handler, pilotos, publicar } = preparar(5, true, bus('BAJA'));

    await expect(codigoRechazado(handler, new AsignarBusAPiloto(7, 8, 9))).resolves.toBe(
      'BUS_DE_BAJA',
    );
    expect(pilotos.update.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('rechaza un bus inexistente', async () => {
    const { handler, pilotos } = preparar(5, true, null);

    await expect(codigoRechazado(handler, new AsignarBusAPiloto(7, 99, 9))).resolves.toBe(
      'BUS_NO_EXISTE',
    );
    expect(pilotos.update.mock.calls).toHaveLength(0);
  });

  it('rechaza un piloto inexistente', async () => {
    const { handler, pilotos, publicar } = preparar(null, false);

    await expect(codigoRechazado(handler, new AsignarBusAPiloto(99, 8, 9))).resolves.toBe(
      'PILOTO_NO_EXISTE',
    );
    expect(pilotos.update.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });
});
