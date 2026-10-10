import { In, type Repository } from 'typeorm';
import { AlertaCapacidad } from '../../entities/alerta-capacidad.entity';
import type { FlotaAdapter } from '../../infrastructure/adapters/flota.adapter';
import type { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import type { UsuariosAdapter } from '../../infrastructure/adapters/usuarios.adapter';
import { ListarAlertas } from '../impl/listar-alertas.query';
import { ListarAlertasHandler } from './listar-alertas.handler';

function alerta(id: number, extra: Partial<AlertaCapacidad> = {}): AlertaCapacidad {
  return {
    id,
    estacionId: 3,
    busId: 7,
    tipo: 'SOBRECUPO',
    porcentajeOcupacion: 150,
    fechaHora: new Date('2026-10-09T10:00:00.000Z'),
    atendida: false,
    atendidaPor: null,
    ...extra,
  };
}

interface Preparado {
  handler: ListarAlertasHandler;
  findAndCount: jest.Mock;
  obtenerLineas: jest.Mock;
  obtenerEstaciones: jest.Mock;
  obtenerBuses: jest.Mock;
  busesDeLinea: jest.Mock;
  obtenerUsuarios: jest.Mock;
}

function preparar(filas: AlertaCapacidad[], busesDeLinea: { id: number }[] = []): Preparado {
  const findAndCount = jest.fn().mockResolvedValue([filas, filas.length]);
  const alertas = { findAndCount } as unknown as Repository<AlertaCapacidad>;
  const obtenerLineas = jest.fn().mockResolvedValue([{ id: 2, codigo: 'L2', nombre: 'Línea 2' }]);
  const obtenerEstaciones = jest
    .fn()
    .mockResolvedValue([{ id: 3, codigo: 'E003', nombre: 'Centro' }]);
  const obtenerBuses = jest
    .fn()
    .mockResolvedValue([
      { id: 7, placa: 'TM-0007', capacidadMax: 100, lineaId: 2, estado: 'ACTIVO' },
    ]);
  const buses = jest.fn().mockResolvedValue(busesDeLinea);
  const obtenerUsuarios = jest
    .fn()
    .mockResolvedValue([{ id: 9, nombre: 'Ana Operadora', correo: 'a@x' }]);
  const handler = new ListarAlertasHandler(
    alertas,
    { obtenerLineas, obtenerEstaciones } as unknown as RedAdapter,
    { obtenerBuses, busesDeLinea: buses } as unknown as FlotaAdapter,
    { obtenerUsuarios } as unknown as UsuariosAdapter,
  );
  return {
    handler,
    findAndCount,
    obtenerLineas,
    obtenerEstaciones,
    obtenerBuses,
    busesDeLinea: buses,
    obtenerUsuarios,
  };
}

const PAGINA = { pagina: 1, tamano: 25 };

describe('ListarAlertasHandler', () => {
  it('ordena pendientes primero y luego por fecha descendente', async () => {
    const { handler, findAndCount } = preparar([alerta(1)]);

    await handler.execute(new ListarAlertas({}, PAGINA));

    expect(findAndCount).toHaveBeenCalledWith({
      where: {},
      order: { atendida: 'ASC', fechaHora: 'DESC', id: 'DESC' },
      skip: 0,
      take: 25,
    });
  });

  it('pagina con el desplazamiento de la página pedida', async () => {
    const { handler, findAndCount } = preparar([]);

    const pagina = await handler.execute(new ListarAlertas({}, { pagina: 3, tamano: 10 }));

    expect(findAndCount).toHaveBeenCalledWith(expect.objectContaining({ skip: 20, take: 10 }));
    expect(pagina).toEqual({ elementos: [], total: 0, pagina: 3, tamano: 10 });
  });

  it('filtra por estado, tipo y estación', async () => {
    const { handler, findAndCount } = preparar([]);

    await handler.execute(
      new ListarAlertas({ estado: 'pendiente', tipo: 'BAJA_OCUPACION', estacionId: 3 }, PAGINA),
    );
    await handler.execute(new ListarAlertas({ estado: 'atendida' }, PAGINA));

    expect(findAndCount).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: { estacionId: 3, tipo: 'BAJA_OCUPACION', atendida: false },
      }),
    );
    expect(findAndCount).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ where: { atendida: true } }),
    );
  });

  it('filtra por línea con los buses que da el puerto de flota', async () => {
    const { handler, findAndCount, busesDeLinea } = preparar([], [{ id: 7 }, { id: 8 }]);

    await handler.execute(new ListarAlertas({ lineaId: 2 }, PAGINA));

    expect(busesDeLinea).toHaveBeenCalledWith(2);
    expect(findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({ where: { busId: In([7, 8]) } }),
    );
  });

  it('una línea sin buses devuelve una página vacía sin consultar la tabla', async () => {
    const { handler, findAndCount } = preparar([alerta(1)], []);

    const pagina = await handler.execute(new ListarAlertas({ lineaId: 2 }, PAGINA));

    expect(pagina).toEqual({ elementos: [], total: 0, ...PAGINA });
    expect(findAndCount).not.toHaveBeenCalled();
  });

  it('arma cada alerta con nombres de estación, bus, línea y quien atendió, y el aviso del tipo', async () => {
    const { handler, obtenerLineas, obtenerEstaciones, obtenerUsuarios } = preparar([
      alerta(2, { atendida: true, atendidaPor: 9 }),
      alerta(1, { tipo: 'BAJA_OCUPACION', porcentajeOcupacion: 24 }),
    ]);

    const pagina = await handler.execute(new ListarAlertas({}, PAGINA));

    expect(pagina.total).toBe(2);
    expect(pagina.elementos).toEqual([
      {
        id: 2,
        tipo: 'SOBRECUPO',
        aviso: 'Hace falta otra unidad en esta estación.',
        porcentaje: 150,
        fechaHora: '2026-10-09T10:00:00.000Z',
        atendida: true,
        estacion: { id: 3, codigo: 'E003', nombre: 'Centro' },
        bus: { id: 7, placa: 'TM-0007' },
        linea: { id: 2, codigo: 'L2', nombre: 'Línea 2' },
        atendidaPor: { id: 9, nombre: 'Ana Operadora' },
      },
      expect.objectContaining({
        id: 1,
        tipo: 'BAJA_OCUPACION',
        aviso: 'Debe esperar 5 minutos adicionales en esta estación.',
        porcentaje: 24,
        atendidaPor: null,
      }),
    ]);
    expect(obtenerLineas).toHaveBeenCalledWith([2]);
    expect(obtenerEstaciones).toHaveBeenCalledWith([3]);
    expect(obtenerUsuarios).toHaveBeenCalledWith([9]);
  });

  it('pide cada referencia una sola vez por página', async () => {
    const { handler, obtenerEstaciones, obtenerBuses } = preparar([
      alerta(3),
      alerta(2),
      alerta(1),
    ]);

    await handler.execute(new ListarAlertas({}, PAGINA));

    expect(obtenerBuses).toHaveBeenCalledTimes(1);
    expect(obtenerBuses).toHaveBeenCalledWith([7]);
    expect(obtenerEstaciones).toHaveBeenCalledTimes(1);
  });

  it('no escribe: el repositorio solo expone la lectura', async () => {
    const { handler, findAndCount } = preparar([alerta(1)]);

    await handler.execute(new ListarAlertas({}, PAGINA));

    expect(findAndCount).toHaveBeenCalledTimes(1);
  });
});
