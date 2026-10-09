import type { EventBus } from '@nestjs/cqrs';
import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import { AccesoGuardia } from '../../entities/acceso-guardia.entity';
import { Acceso } from '../../entities/acceso.entity';
import { AsignacionQuitada } from '../../events/eventos-de-accesos';
import { QuitarAsignacion } from '../impl/quitar-asignacion.command';
import { QuitarAsignacionHandler } from './quitar-asignacion.handler';

interface Preparado {
  handler: QuitarAsignacionHandler;
  accesos: RepositorioSimulado<Acceso>;
  asignaciones: RepositorioSimulado<AccesoGuardia>;
  publicar: jest.Mock;
}

function preparar({ accesoExiste = true, asignacionExiste = true, cuantas = 2 } = {}): Preparado {
  const unidad = new UnidadDeTrabajoSimulada();
  const accesos = unidad.registrar(Acceso);
  const asignaciones = unidad.registrar(AccesoGuardia);
  accesos.findOne.mockResolvedValue(accesoExiste ? ({ id: 10 } as Acceso) : null);
  asignaciones.existsBy.mockResolvedValue(asignacionExiste);
  asignaciones.countBy.mockResolvedValue(cuantas);
  asignaciones.delete.mockResolvedValue({} as never);
  const publicar = jest.fn();
  const handler = new QuitarAsignacionHandler(unidad, {
    publish: publicar,
  } as unknown as EventBus);
  return { handler, accesos, asignaciones, publicar };
}

describe('QuitarAsignacionHandler', () => {
  it('quita una de dos asignaciones y lo avisa con el supervisor', async () => {
    const { handler, asignaciones, publicar } = preparar({ cuantas: 2 });

    await handler.execute(new QuitarAsignacion(10, 4, '6:00-14:00', 9));

    expect(asignaciones.delete.mock.calls).toEqual([
      [{ accesoId: 10, guardiaId: 4, turno: '06:00-14:00' }],
    ]);
    expect(publicar).toHaveBeenCalledWith(new AsignacionQuitada(9, 10, 4, '06:00-14:00'));
  });

  it('rechaza quitar la última asignación y la deja', async () => {
    const { handler, asignaciones, publicar } = preparar({ cuantas: 1 });

    await expect(
      handler.execute(new QuitarAsignacion(10, 4, '06:00-14:00', 9)),
    ).rejects.toMatchObject({ codigo: 'ACCESO_SIN_GUARDIA', tipo: 'REGLA_NEGOCIO' });
    expect(asignaciones.delete.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('bloquea la fila del acceso antes de contar sus asignaciones', async () => {
    const { handler, accesos, asignaciones } = preparar();

    await handler.execute(new QuitarAsignacion(10, 4, '06:00-14:00', 9));

    expect(accesos.findOne.mock.calls).toEqual([
      [{ where: { id: 10 }, lock: { mode: 'pessimistic_write' } }],
    ]);
    expect(accesos.findOne.mock.invocationCallOrder[0]).toBeLessThan(
      asignaciones.countBy.mock.invocationCallOrder[0] ?? 0,
    );
  });

  it('rechaza una asignación que no existe', async () => {
    const { handler, asignaciones, publicar } = preparar({ asignacionExiste: false });

    await expect(
      handler.execute(new QuitarAsignacion(10, 4, '06:00-14:00', 9)),
    ).rejects.toMatchObject({ codigo: 'ASIGNACION_NO_EXISTE', tipo: 'NO_ENCONTRADO' });
    expect(asignaciones.delete.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('trata un turno mal escrito como una asignación que no existe', async () => {
    const { handler, asignaciones } = preparar({ asignacionExiste: false });

    await expect(handler.execute(new QuitarAsignacion(10, 4, 'mañana', 9))).rejects.toMatchObject({
      codigo: 'ASIGNACION_NO_EXISTE',
    });
    expect(asignaciones.existsBy.mock.calls).toContainEqual([
      { accesoId: 10, guardiaId: 4, turno: 'mañana' },
    ]);
  });

  it('rechaza un acceso inexistente', async () => {
    const { handler, publicar } = preparar({ accesoExiste: false });

    await expect(
      handler.execute(new QuitarAsignacion(10, 4, '06:00-14:00', 9)),
    ).rejects.toMatchObject({ codigo: 'ACCESO_NO_EXISTE', tipo: 'NO_ENCONTRADO' });
    expect(publicar).not.toHaveBeenCalled();
  });
});
