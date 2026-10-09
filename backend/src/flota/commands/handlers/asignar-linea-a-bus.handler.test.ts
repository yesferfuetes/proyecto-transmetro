import type { EventBus } from '@nestjs/cqrs';
import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import type { LineaResumen } from '../../../shared/contratos/red';
import { Bus } from '../../entities/bus.entity';
import { LineaDeBusCambiada } from '../../events/eventos-de-flota';
import type { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { AsignarLineaABus } from '../impl/asignar-linea-a-bus.command';
import { AsignarLineaABusHandler } from './asignar-linea-a-bus.handler';

interface Preparado {
  handler: AsignarLineaABusHandler;
  unidad: UnidadDeTrabajoSimulada;
  buses: RepositorioSimulado<Bus>;
  publicar: jest.Mock;
}

function linea(id: number, extra: Partial<LineaResumen> = {}): LineaResumen {
  return {
    id,
    codigo: `L${id}`,
    nombre: `Línea ${id}`,
    estado: 'ACTIVA',
    numeroDeEstaciones: 3,
    ...extra,
  };
}

/** `conteos` dice cuántos buses tiene cada línea antes de la operación. */
function preparar(
  bus: Partial<Bus> | null,
  lineas: LineaResumen[],
  conteos: Record<number, number>,
): Preparado {
  const unidad = new UnidadDeTrabajoSimulada();
  const buses = unidad.registrar(Bus);
  buses.findOne.mockResolvedValue(bus as Bus | null);
  buses.countBy.mockImplementation((donde) =>
    Promise.resolve(conteos[(donde as { lineaId: number }).lineaId] ?? 0),
  );
  const red = {
    obtenerLinea: jest.fn((id: number) => Promise.resolve(lineas.find((l) => l.id === id) ?? null)),
  } as unknown as RedAdapter;
  const publicar = jest.fn();
  const handler = new AsignarLineaABusHandler(unidad, red, {
    publish: publicar,
  } as unknown as EventBus);
  return { handler, unidad, buses, publicar };
}

const SIN_LINEA = { id: 1, estado: 'ACTIVO', lineaId: null };
const EN_LINEA_2 = { id: 1, estado: 'ACTIVO', lineaId: 2 };

describe('AsignarLineaABusHandler', () => {
  it('asigna una línea con cupo, la bloquea y avisa con el actor, el bus, la anterior y la nueva', async () => {
    const { handler, buses, unidad, publicar } = preparar(SIN_LINEA, [linea(4)], { 4: 3 });

    await handler.execute(new AsignarLineaABus(1, 4, 9));

    expect(buses.update.mock.calls).toContainEqual([{ id: 1 }, { lineaId: 4 }]);
    expect(unidad.candados).toEqual([{ espacio: 'flota-linea', id: 4 }]);
    const [[evento]] = publicar.mock.calls as [[LineaDeBusCambiada]];
    expect(evento).toEqual(new LineaDeBusCambiada(9, 1, null, 4));
    expect(evento).toMatchObject({
      usuarioId: 9,
      accion: 'LINEA_DE_BUS_CAMBIADA',
      entidad: 'bus',
      entidadId: '1',
      resumen: { anterior: null, nueva: 4 },
    });
  });

  it('bloquea la fila del bus', async () => {
    const { handler, buses } = preparar(SIN_LINEA, [linea(4)], { 4: 3 });

    await handler.execute(new AsignarLineaABus(1, 4, 9));

    expect(buses.findOne.mock.calls).toContainEqual([
      {
        where: { id: 1 },
        lock: { mode: 'pessimistic_write' },
      },
    ]);
  });

  it('rechaza asignar a una línea de 3 estaciones que ya tiene 6 buses', async () => {
    const { handler, buses, publicar } = preparar(SIN_LINEA, [linea(4)], { 4: 6 });

    await expect(handler.execute(new AsignarLineaABus(1, 4, 9))).rejects.toMatchObject({
      codigo: 'FLOTA_MAXIMA_EXCEDIDA',
    });
    expect(buses.update.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('rechaza cualquier bus en una línea con 0 estaciones', async () => {
    const { handler } = preparar(
      SIN_LINEA,
      [linea(4, { numeroDeEstaciones: 0, estado: 'EN_CONSTRUCCION' })],
      { 4: 0 },
    );

    await expect(handler.execute(new AsignarLineaABus(1, 4, 9))).rejects.toMatchObject({
      codigo: 'FLOTA_MAXIMA_EXCEDIDA',
    });
  });

  it('rechaza una línea inactiva', async () => {
    const { handler, buses } = preparar(SIN_LINEA, [linea(4, { estado: 'INACTIVA' })], {});

    await expect(handler.execute(new AsignarLineaABus(1, 4, 9))).rejects.toMatchObject({
      codigo: 'LINEA_INACTIVA',
    });
    expect(buses.update.mock.calls).toHaveLength(0);
  });

  it('rechaza una línea inexistente', async () => {
    const { handler } = preparar(SIN_LINEA, [], {});

    await expect(handler.execute(new AsignarLineaABus(1, 99, 9))).rejects.toMatchObject({
      codigo: 'LINEA_NO_EXISTE',
    });
  });

  it('quita el bus de una línea en construcción aunque quede bajo el mínimo', async () => {
    const { handler, buses, publicar } = preparar(
      EN_LINEA_2,
      [linea(2, { estado: 'EN_CONSTRUCCION' })],
      { 2: 1 },
    );

    await handler.execute(new AsignarLineaABus(1, null, 9));

    expect(buses.update.mock.calls).toContainEqual([{ id: 1 }, { lineaId: null }]);
    expect(publicar).toHaveBeenCalledWith(new LineaDeBusCambiada(9, 1, 2, null));
  });

  it('rechaza quitar un bus de una línea activa que quedaría bajo el mínimo y no cambia nada', async () => {
    const { handler, buses, publicar } = preparar(EN_LINEA_2, [linea(2)], { 2: 3 });

    await expect(handler.execute(new AsignarLineaABus(1, null, 9))).rejects.toMatchObject({
      codigo: 'FLOTA_MINIMA_INSUFICIENTE',
    });
    expect(buses.update.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('quita un bus de una línea activa que conserva el mínimo', async () => {
    const { handler, buses } = preparar(EN_LINEA_2, [linea(2)], { 2: 4 });

    await handler.execute(new AsignarLineaABus(1, null, 9));

    expect(buses.update.mock.calls).toContainEqual([{ id: 1 }, { lineaId: null }]);
  });

  it('mueve un bus de una línea con 4 a otra con 3 y pide los dos candados en orden ascendente', async () => {
    const { handler, buses, unidad } = preparar(
      { id: 1, estado: 'ACTIVO', lineaId: 8 },
      [linea(8), linea(3)],
      { 8: 4, 3: 3 },
    );

    await handler.execute(new AsignarLineaABus(1, 3, 9));

    expect(buses.update.mock.calls).toContainEqual([{ id: 1 }, { lineaId: 3 }]);
    expect(unidad.candados).toEqual([
      { espacio: 'flota-linea', id: 3 },
      { espacio: 'flota-linea', id: 8 },
    ]);
  });

  it('pide los candados en orden ascendente también cuando el origen es el menor', async () => {
    const { handler, unidad } = preparar(
      { id: 1, estado: 'ACTIVO', lineaId: 2 },
      [linea(2), linea(5)],
      { 2: 4, 5: 3 },
    );

    await handler.execute(new AsignarLineaABus(1, 5, 9));

    expect(unidad.candados.map((candado) => candado.id)).toEqual([2, 5]);
  });

  it('rechaza mover un bus de una línea activa en el mínimo y no cambia nada', async () => {
    const { handler, buses } = preparar(EN_LINEA_2, [linea(2), linea(5)], { 2: 3, 5: 3 });

    await expect(handler.execute(new AsignarLineaABus(1, 5, 9))).rejects.toMatchObject({
      codigo: 'FLOTA_MINIMA_INSUFICIENTE',
    });
    expect(buses.update.mock.calls).toHaveLength(0);
  });

  it('rechaza mover un bus a una línea llena', async () => {
    const { handler } = preparar(EN_LINEA_2, [linea(2), linea(5)], { 2: 5, 5: 6 });

    await expect(handler.execute(new AsignarLineaABus(1, 5, 9))).rejects.toMatchObject({
      codigo: 'FLOTA_MAXIMA_EXCEDIDA',
    });
  });

  it('rechaza el cambio de un bus de baja', async () => {
    const { handler, buses } = preparar({ id: 1, estado: 'BAJA', lineaId: null }, [linea(4)], {});

    await expect(handler.execute(new AsignarLineaABus(1, 4, 9))).rejects.toMatchObject({
      codigo: 'BUS_DE_BAJA',
    });
    expect(buses.update.mock.calls).toHaveLength(0);
  });

  it('rechaza un bus inexistente', async () => {
    const { handler } = preparar(null, [], {});

    await expect(handler.execute(new AsignarLineaABus(9, 4, 9))).rejects.toMatchObject({
      codigo: 'BUS_NO_EXISTE',
    });
  });

  it('no escribe ni avisa si la línea no cambia', async () => {
    const { handler, buses, publicar, unidad } = preparar(EN_LINEA_2, [linea(2)], { 2: 3 });

    await handler.execute(new AsignarLineaABus(1, 2, 9));

    expect(buses.update.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
    expect(unidad.candados).toEqual([]);
  });

  it('un bus en mantenimiento cuenta como parte de la línea y puede cambiar de línea', async () => {
    const { handler, buses } = preparar(
      { id: 1, estado: 'MANTENIMIENTO', lineaId: null },
      [linea(4)],
      {
        4: 3,
      },
    );

    await handler.execute(new AsignarLineaABus(1, 4, 9));

    expect(buses.update.mock.calls).toContainEqual([{ id: 1 }, { lineaId: 4 }]);
  });
});
