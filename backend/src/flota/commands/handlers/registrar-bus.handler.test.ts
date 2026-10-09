import type { EventBus } from '@nestjs/cqrs';
import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import type { LineaResumen } from '../../../shared/contratos/red';
import { Bus } from '../../entities/bus.entity';
import { Parqueo } from '../../entities/parqueo.entity';
import { BusRegistrado } from '../../events/eventos-de-flota';
import type { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { RegistrarBus } from '../impl/registrar-bus.command';
import { RegistrarBusHandler } from './registrar-bus.handler';

interface Preparado {
  handler: RegistrarBusHandler;
  unidad: UnidadDeTrabajoSimulada;
  buses: RepositorioSimulado<Bus>;
  parqueos: RepositorioSimulado<Parqueo>;
  publicar: jest.Mock;
}

interface Escenario {
  linea?: LineaResumen | null;
  busesEnLinea?: number;
  parqueo?: Partial<Parqueo> | null;
  busesEnParqueo?: number;
  placaExistente?: boolean;
}

const LINEA_ACTIVA: LineaResumen = {
  id: 7,
  codigo: 'L7',
  nombre: 'Línea 7',
  estado: 'ACTIVA',
  numeroDeEstaciones: 3,
};
const PARQUEO = { id: 5, codigo: 'P1', capacidadVehiculos: 10 };

function preparar(escenario: Escenario = {}): Preparado {
  const unidad = new UnidadDeTrabajoSimulada();
  const buses = unidad.registrar(Bus);
  const parqueos = unidad.registrar(Parqueo);
  buses.countBy.mockImplementation((donde) =>
    Promise.resolve(
      'lineaId' in donde ? (escenario.busesEnLinea ?? 0) : (escenario.busesEnParqueo ?? 0),
    ),
  );
  buses.existsBy.mockResolvedValue(escenario.placaExistente ?? false);
  buses.save.mockResolvedValue({ id: 42 } as Bus);
  parqueos.findOne.mockResolvedValue(
    (escenario.parqueo === undefined ? PARQUEO : escenario.parqueo) as Parqueo | null,
  );
  const red = {
    obtenerLinea: jest.fn().mockResolvedValue(escenario.linea ?? null),
  } as unknown as RedAdapter;
  const publicar = jest.fn();
  const handler = new RegistrarBusHandler(unidad, red, {
    publish: publicar,
  } as unknown as EventBus);
  return { handler, unidad, buses, parqueos, publicar };
}

const DATOS = { placa: 'TM-0100', capacidadMax: 120, parqueoId: 5 };

describe('RegistrarBusHandler', () => {
  it('registra un bus activo sin línea en un parqueo con cupo y avisa', async () => {
    const { handler, buses, publicar, unidad } = preparar();

    await expect(handler.execute(new RegistrarBus(DATOS, 9))).resolves.toBe(42);

    expect(buses.save.mock.calls).toContainEqual([
      {
        placa: 'TM-0100',
        capacidadMax: 120,
        lineaId: null,
        parqueoId: 5,
        estado: 'ACTIVO',
      },
    ]);
    expect(publicar).toHaveBeenCalledWith(new BusRegistrado(9, 42, 'TM-0100', null, 5));
    expect(unidad.candados).toEqual([]);
  });

  it('guarda la placa en mayúsculas y sin espacios a los lados', async () => {
    const { handler, buses } = preparar();

    await handler.execute(new RegistrarBus({ ...DATOS, placa: ' tm-0100 ' }, 9));

    expect(buses.existsBy.mock.calls).toContainEqual([{ placa: 'TM-0100' }]);
    expect(buses.save.mock.calls[0]?.[0]).toMatchObject({ placa: 'TM-0100' });
  });

  it('rechaza una placa que, normalizada, ya existe', async () => {
    const { handler, buses, publicar } = preparar({ placaExistente: true });

    await expect(
      handler.execute(new RegistrarBus({ ...DATOS, placa: ' tm-0001 ' }, 9)),
    ).rejects.toMatchObject({ codigo: 'PLACA_DUPLICADA' });
    expect(buses.save.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it.each(['', '   ', 'ABCDEFGHIJKLMNOP'])('rechaza la placa "%s"', async (placa) => {
    const { handler, buses } = preparar();

    await expect(handler.execute(new RegistrarBus({ ...DATOS, placa }, 9))).rejects.toMatchObject({
      codigo: 'PLACA_INVALIDA',
    });
    expect(buses.save.mock.calls).toHaveLength(0);
  });

  it('acepta una placa de 15 caracteres', async () => {
    const { handler } = preparar();

    await expect(
      handler.execute(new RegistrarBus({ ...DATOS, placa: 'ABCDEFGHIJKLMNO' }, 9)),
    ).resolves.toBe(42);
  });

  it.each([0, 301, -5, 1.5])('rechaza la capacidad %p', async (capacidadMax) => {
    const { handler, buses } = preparar();

    await expect(
      handler.execute(new RegistrarBus({ ...DATOS, capacidadMax }, 9)),
    ).rejects.toMatchObject({ codigo: 'CAPACIDAD_INVALIDA' });
    expect(buses.save.mock.calls).toHaveLength(0);
  });

  it.each([1, 300])('acepta la capacidad %i', async (capacidadMax) => {
    const { handler } = preparar();

    await expect(handler.execute(new RegistrarBus({ ...DATOS, capacidadMax }, 9))).resolves.toBe(
      42,
    );
  });

  it.each([null, undefined])(
    'rechaza un bus sin parqueo (%p) y no crea nada',
    async (parqueoId) => {
      const { handler, buses, unidad } = preparar();

      await expect(
        handler.execute(new RegistrarBus({ ...DATOS, parqueoId }, 9)),
      ).rejects.toMatchObject({ codigo: 'BUS_SIN_PARQUEO' });
      expect(buses.save.mock.calls).toHaveLength(0);
      expect(unidad.ejecuciones).toBe(0);
    },
  );

  it('rechaza un parqueo inexistente', async () => {
    const { handler, buses } = preparar({ parqueo: null });

    await expect(handler.execute(new RegistrarBus(DATOS, 9))).rejects.toMatchObject({
      codigo: 'PARQUEO_NO_EXISTE',
    });
    expect(buses.save.mock.calls).toHaveLength(0);
  });

  it('rechaza un parqueo lleno', async () => {
    const { handler, buses } = preparar({
      parqueo: { id: 5, codigo: 'P1', capacidadVehiculos: 2 },
      busesEnParqueo: 2,
    });

    await expect(handler.execute(new RegistrarBus(DATOS, 9))).rejects.toMatchObject({
      codigo: 'PARQUEO_LLENO',
    });
    expect(buses.save.mock.calls).toHaveLength(0);
  });

  it('acepta el último lugar del parqueo', async () => {
    const { handler } = preparar({
      parqueo: { id: 5, codigo: 'P1', capacidadVehiculos: 2 },
      busesEnParqueo: 1,
    });

    await expect(handler.execute(new RegistrarBus(DATOS, 9))).resolves.toBe(42);
  });

  it('bloquea el parqueo antes de contar sus buses', async () => {
    const { handler, parqueos } = preparar();

    await handler.execute(new RegistrarBus(DATOS, 9));

    expect(parqueos.findOne.mock.calls).toContainEqual([
      {
        where: { id: 5 },
        lock: { mode: 'pessimistic_write' },
      },
    ]);
  });

  it('registra con línea y pide el candado de esa línea', async () => {
    const { handler, buses, unidad, publicar } = preparar({ linea: LINEA_ACTIVA, busesEnLinea: 3 });

    await handler.execute(new RegistrarBus({ ...DATOS, lineaId: 7 }, 9));

    expect(unidad.candados).toEqual([{ espacio: 'flota-linea', id: 7 }]);
    expect(buses.save.mock.calls[0]?.[0]).toMatchObject({ lineaId: 7 });
    expect(publicar).toHaveBeenCalledWith(new BusRegistrado(9, 42, 'TM-0100', 7, 5));
  });

  it('rechaza una línea que no existe', async () => {
    const { handler, buses } = preparar({ linea: null });

    await expect(
      handler.execute(new RegistrarBus({ ...DATOS, lineaId: 99 }, 9)),
    ).rejects.toMatchObject({ codigo: 'LINEA_NO_EXISTE' });
    expect(buses.save.mock.calls).toHaveLength(0);
  });

  it('rechaza una línea inactiva', async () => {
    const { handler, buses } = preparar({ linea: { ...LINEA_ACTIVA, estado: 'INACTIVA' } });

    await expect(
      handler.execute(new RegistrarBus({ ...DATOS, lineaId: 7 }, 9)),
    ).rejects.toMatchObject({ codigo: 'LINEA_INACTIVA' });
    expect(buses.save.mock.calls).toHaveLength(0);
  });

  it('acepta una línea en construcción', async () => {
    const { handler } = preparar({
      linea: { ...LINEA_ACTIVA, estado: 'EN_CONSTRUCCION' },
      busesEnLinea: 0,
    });

    await expect(handler.execute(new RegistrarBus({ ...DATOS, lineaId: 7 }, 9))).resolves.toBe(42);
  });

  it('rechaza una línea que ya tiene el máximo de 2n buses', async () => {
    const { handler, buses } = preparar({ linea: LINEA_ACTIVA, busesEnLinea: 6 });

    await expect(
      handler.execute(new RegistrarBus({ ...DATOS, lineaId: 7 }, 9)),
    ).rejects.toMatchObject({
      codigo: 'FLOTA_MAXIMA_EXCEDIDA',
      message: 'La línea L7 admite como máximo 6 buses y ya tiene 6.',
    });
    expect(buses.save.mock.calls).toHaveLength(0);
  });

  it('acepta el bus que completa el máximo', async () => {
    const { handler } = preparar({ linea: LINEA_ACTIVA, busesEnLinea: 5 });

    await expect(handler.execute(new RegistrarBus({ ...DATOS, lineaId: 7 }, 9))).resolves.toBe(42);
  });

  it('rechaza cualquier bus en una línea sin recorrido', async () => {
    const { handler } = preparar({
      linea: { ...LINEA_ACTIVA, estado: 'EN_CONSTRUCCION', numeroDeEstaciones: 0 },
      busesEnLinea: 0,
    });

    await expect(
      handler.execute(new RegistrarBus({ ...DATOS, lineaId: 7 }, 9)),
    ).rejects.toMatchObject({ codigo: 'FLOTA_MAXIMA_EXCEDIDA' });
  });
});
