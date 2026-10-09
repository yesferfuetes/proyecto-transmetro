import type { EventBus } from '@nestjs/cqrs';
import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import type { LineaResumen } from '../../../shared/contratos/red';
import { Bus } from '../../entities/bus.entity';
import { EstadoDeBusCambiado } from '../../events/eventos-de-flota';
import type { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { CambiarEstadoDeBus } from '../impl/cambiar-estado-de-bus.command';
import { CambiarEstadoDeBusHandler } from './cambiar-estado-de-bus.handler';

interface Preparado {
  handler: CambiarEstadoDeBusHandler;
  unidad: UnidadDeTrabajoSimulada;
  buses: RepositorioSimulado<Bus>;
  publicar: jest.Mock;
}

const LINEA: LineaResumen = {
  id: 2,
  codigo: 'L2',
  nombre: 'Línea 2',
  estado: 'ACTIVA',
  numeroDeEstaciones: 3,
};

function preparar(
  bus: Partial<Bus> | null,
  busesEnLinea = 5,
  linea: LineaResumen | null = LINEA,
): Preparado {
  const unidad = new UnidadDeTrabajoSimulada();
  const buses = unidad.registrar(Bus);
  buses.findOne.mockResolvedValue(bus as Bus | null);
  buses.countBy.mockResolvedValue(busesEnLinea);
  const red = { obtenerLinea: jest.fn().mockResolvedValue(linea) } as unknown as RedAdapter;
  const publicar = jest.fn();
  const handler = new CambiarEstadoDeBusHandler(unidad, red, {
    publish: publicar,
  } as unknown as EventBus);
  return { handler, unidad, buses, publicar };
}

const ACTIVO_EN_LINEA = { id: 1, estado: 'ACTIVO', lineaId: 2 };

describe('CambiarEstadoDeBusHandler', () => {
  it('pasa a mantenimiento sin tocar la línea y avisa', async () => {
    const { handler, buses, publicar, unidad } = preparar(ACTIVO_EN_LINEA);

    await handler.execute(new CambiarEstadoDeBus(1, 'MANTENIMIENTO', 9));

    expect(buses.update.mock.calls).toContainEqual([{ id: 1 }, { estado: 'MANTENIMIENTO' }]);
    expect(publicar).toHaveBeenCalledWith(
      new EstadoDeBusCambiado(9, 1, 'ACTIVO', 'MANTENIMIENTO', false),
    );
    expect(unidad.candados).toEqual([]);
  });

  it('la baja quita la línea en la misma operación, con el candado de la línea', async () => {
    const { handler, buses, publicar, unidad } = preparar(ACTIVO_EN_LINEA, 5);

    await handler.execute(new CambiarEstadoDeBus(1, 'BAJA', 9));

    expect(buses.update.mock.calls).toContainEqual([{ id: 1 }, { estado: 'BAJA', lineaId: null }]);
    expect(unidad.candados).toEqual([{ espacio: 'flota-linea', id: 2 }]);
    expect(publicar).toHaveBeenCalledWith(new EstadoDeBusCambiado(9, 1, 'ACTIVO', 'BAJA', true));
  });

  it('la baja de un bus sin línea no pide candados', async () => {
    const { handler, buses, unidad } = preparar({ id: 1, estado: 'ACTIVO', lineaId: null });

    await handler.execute(new CambiarEstadoDeBus(1, 'BAJA', 9));

    expect(buses.update.mock.calls).toContainEqual([{ id: 1 }, { estado: 'BAJA' }]);
    expect(unidad.candados).toEqual([]);
  });

  it('rechaza la baja que dejaría una línea activa bajo el mínimo y no cambia nada', async () => {
    const { handler, buses, publicar } = preparar(ACTIVO_EN_LINEA, 3);

    await expect(handler.execute(new CambiarEstadoDeBus(1, 'BAJA', 9))).rejects.toMatchObject({
      codigo: 'FLOTA_MINIMA_INSUFICIENTE',
    });
    expect(buses.update.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('da de baja un bus de una línea en construcción aunque quede bajo el mínimo', async () => {
    const { handler, buses } = preparar(ACTIVO_EN_LINEA, 1, {
      ...LINEA,
      estado: 'EN_CONSTRUCCION',
    });

    await handler.execute(new CambiarEstadoDeBus(1, 'BAJA', 9));

    expect(buses.update.mock.calls).toContainEqual([{ id: 1 }, { estado: 'BAJA', lineaId: null }]);
  });

  it.each(['ACTIVO', 'MANTENIMIENTO', 'BAJA'])(
    'rechaza cambiar el estado de un bus de baja a %s',
    async (estado) => {
      const { handler, buses } = preparar({ id: 1, estado: 'BAJA', lineaId: null });

      await expect(handler.execute(new CambiarEstadoDeBus(1, estado, 9))).rejects.toMatchObject({
        codigo: 'BUS_DE_BAJA',
      });
      expect(buses.update.mock.calls).toHaveLength(0);
    },
  );

  it.each(['CHATARRA', 'activo', ''])('rechaza el estado "%s"', async (estado) => {
    const { handler, unidad } = preparar(ACTIVO_EN_LINEA);

    await expect(handler.execute(new CambiarEstadoDeBus(1, estado, 9))).rejects.toMatchObject({
      codigo: 'ESTADO_BUS_INVALIDO',
    });
    expect(unidad.ejecuciones).toBe(0);
  });

  it('rechaza un bus inexistente', async () => {
    const { handler } = preparar(null);

    await expect(handler.execute(new CambiarEstadoDeBus(9, 'BAJA', 9))).rejects.toMatchObject({
      codigo: 'BUS_NO_EXISTE',
    });
  });

  it('no escribe ni avisa si el estado no cambia', async () => {
    const { handler, buses, publicar } = preparar(ACTIVO_EN_LINEA);

    await handler.execute(new CambiarEstadoDeBus(1, 'ACTIVO', 9));

    expect(buses.update.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });
});
