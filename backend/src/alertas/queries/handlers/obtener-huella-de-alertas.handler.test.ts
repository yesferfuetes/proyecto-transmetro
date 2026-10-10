import type { Repository } from 'typeorm';
import type { AlertaCapacidad } from '../../entities/alerta-capacidad.entity';
import { ObtenerHuellaDeAlertas } from '../impl/obtener-huella-de-alertas.query';
import { ObtenerHuellaDeAlertasHandler } from './obtener-huella-de-alertas.handler';

interface Preparado {
  handler: ObtenerHuellaDeAlertasHandler;
  countBy: jest.Mock;
  findOne: jest.Mock;
  escrituras: Record<string, jest.Mock>;
}

function preparar(pendientes: number, atendidas: number, ultimaId: number | null): Preparado {
  const countBy = jest
    .fn()
    .mockImplementation((donde: { atendida: boolean }) =>
      Promise.resolve(donde.atendida ? atendidas : pendientes),
    );
  const findOne = jest.fn().mockResolvedValue(ultimaId === null ? null : { id: ultimaId });
  const escrituras = { save: jest.fn(), update: jest.fn(), insert: jest.fn(), delete: jest.fn() };
  const repositorio = { countBy, findOne, ...escrituras } as unknown as Repository<AlertaCapacidad>;
  return { handler: new ObtenerHuellaDeAlertasHandler(repositorio), countBy, findOne, escrituras };
}

describe('ObtenerHuellaDeAlertasHandler', () => {
  it('cuenta pendientes y atendidas de toda la red y da la última alerta', async () => {
    const { handler, countBy, findOne } = preparar(4, 10, 31);

    await expect(handler.execute(new ObtenerHuellaDeAlertas())).resolves.toEqual({
      pendientes: 4,
      atendidas: 10,
      ultimaId: 31,
    });
    expect(countBy).toHaveBeenCalledWith({ atendida: false });
    expect(countBy).toHaveBeenCalledWith({ atendida: true });
    expect(findOne).toHaveBeenCalledWith({
      where: {},
      order: { id: 'DESC' },
      select: { id: true },
    });
  });

  it('limita las tres cuentas a la estación pedida', async () => {
    const { handler, countBy, findOne } = preparar(1, 2, 8);

    await handler.execute(new ObtenerHuellaDeAlertas(3));

    expect(countBy).toHaveBeenCalledWith({ estacionId: 3, atendida: false });
    expect(countBy).toHaveBeenCalledWith({ estacionId: 3, atendida: true });
    expect(findOne).toHaveBeenCalledWith(expect.objectContaining({ where: { estacionId: 3 } }));
  });

  it('sin alertas devuelve ceros', async () => {
    const { handler } = preparar(0, 0, null);

    await expect(handler.execute(new ObtenerHuellaDeAlertas(3))).resolves.toEqual({
      pendientes: 0,
      atendidas: 0,
      ultimaId: 0,
    });
  });

  it('no escribe nada', async () => {
    const { handler, escrituras } = preparar(1, 1, 2);

    await handler.execute(new ObtenerHuellaDeAlertas());

    Object.values(escrituras).forEach((escritura) => expect(escritura).not.toHaveBeenCalled());
  });
});
