import type { EventBus } from '@nestjs/cqrs';
import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import { AccesoGuardia } from '../../entities/acceso-guardia.entity';
import { Acceso } from '../../entities/acceso.entity';
import { GuardiaSeguridad } from '../../entities/guardia-seguridad.entity';
import { GuardiaAsignado } from '../../events/eventos-de-accesos';
import type { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { AsignarGuardia } from '../impl/asignar-guardia.command';
import { AsignarGuardiaHandler } from './asignar-guardia.handler';

/** El acceso 10 es de la estación 3. */
const ACCESO: Acceso = { id: 10, estacionId: 3, codigo: 'A', nombre: null };

interface Preparado {
  handler: AsignarGuardiaHandler;
  asignaciones: RepositorioSimulado<AccesoGuardia>;
  guardias: RepositorioSimulado<GuardiaSeguridad>;
  publicar: jest.Mock;
}

interface Opciones {
  acceso?: Acceso | null;
  guardiaExiste?: boolean;
  repetida?: boolean;
  delGuardia?: AccesoGuardia[];
}

function preparar({
  acceso = ACCESO,
  guardiaExiste = true,
  repetida = false,
  delGuardia = [],
}: Opciones = {}): Preparado {
  const unidad = new UnidadDeTrabajoSimulada();
  const accesos = unidad.registrar(Acceso);
  const asignaciones = unidad.registrar(AccesoGuardia);
  const guardias = unidad.registrar(GuardiaSeguridad);
  accesos.findOneBy.mockResolvedValue(acceso);
  guardias.findOne.mockResolvedValue(guardiaExiste ? ({ id: 4 } as GuardiaSeguridad) : null);
  asignaciones.existsBy.mockResolvedValue(repetida);
  asignaciones.find.mockResolvedValue(delGuardia);
  asignaciones.insert.mockResolvedValue({} as never);
  const red = {
    obtenerEstacion: jest.fn((id: number) =>
      Promise.resolve({ id, codigo: `E${id}`, nombre: `Estación ${id}` }),
    ),
  } as unknown as RedAdapter;
  const publicar = jest.fn();
  const handler = new AsignarGuardiaHandler(unidad, red, {
    publish: publicar,
  } as unknown as EventBus);
  return { handler, asignaciones, guardias, publicar };
}

function cubre(estacionId: number, turno: string, accesoId = 50): AccesoGuardia {
  return { accesoId, guardiaId: 4, turno, acceso: { id: accesoId, estacionId } as Acceso };
}

describe('AsignarGuardiaHandler', () => {
  it('asigna al guardia con el turno normalizado y lo avisa con el actor', async () => {
    const { handler, asignaciones, publicar } = preparar();

    await handler.execute(new AsignarGuardia(10, 4, '6:00-14:00', 9));

    expect(asignaciones.insert.mock.calls).toEqual([
      [{ accesoId: 10, guardiaId: 4, turno: '06:00-14:00' }],
    ]);
    expect(publicar).toHaveBeenCalledWith(new GuardiaAsignado(9, 10, 4, '06:00-14:00'));
  });

  it('bloquea la fila del guardia antes de leer sus turnos', async () => {
    const { handler, guardias, asignaciones } = preparar();

    await handler.execute(new AsignarGuardia(10, 4, '06:00-14:00', 9));

    expect(guardias.findOne.mock.calls).toEqual([
      [{ where: { id: 4 }, lock: { mode: 'pessimistic_write' } }],
    ]);
    expect(guardias.findOne.mock.invocationCallOrder[0]).toBeLessThan(
      asignaciones.find.mock.invocationCallOrder[0] ?? 0,
    );
  });

  it('rechaza una asignación repetida', async () => {
    const { handler, asignaciones, publicar } = preparar({ repetida: true });

    await expect(
      handler.execute(new AsignarGuardia(10, 4, '06:00-14:00', 9)),
    ).rejects.toMatchObject({ codigo: 'ASIGNACION_DUPLICADA', tipo: 'CONFLICTO' });
    expect(asignaciones.existsBy.mock.calls).toContainEqual([
      { accesoId: 10, guardiaId: 4, turno: '06:00-14:00' },
    ]);
    expect(asignaciones.insert.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('rechaza un turno que se traslapa con otro del guardia en otra estación', async () => {
    const { handler, asignaciones, publicar } = preparar({
      delGuardia: [cubre(8, '06:00-14:00')],
    });

    await expect(
      handler.execute(new AsignarGuardia(10, 4, '10:00-18:00', 9)),
    ).rejects.toMatchObject({ codigo: 'TURNO_TRASLAPADO', tipo: 'REGLA_NEGOCIO' });
    expect(asignaciones.insert.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('nombra el turno y la estación del choque en el mensaje', async () => {
    const { handler } = preparar({ delGuardia: [cubre(8, '06:00-14:00')] });

    await expect(handler.execute(new AsignarGuardia(10, 4, '10:00-18:00', 9))).rejects.toThrow(
      /06:00-14:00.*Estación 8/,
    );
  });

  it('acepta el mismo turno en otro acceso de la misma estación', async () => {
    const { handler, asignaciones } = preparar({ delGuardia: [cubre(3, '06:00-14:00')] });

    await handler.execute(new AsignarGuardia(10, 4, '06:00-14:00', 9));

    expect(asignaciones.insert.mock.calls).toHaveLength(1);
  });

  it('rechaza un turno de madrugada contra el nocturno del guardia en otra estación', async () => {
    const { handler } = preparar({ delGuardia: [cubre(8, '22:00-06:00')] });

    await expect(
      handler.execute(new AsignarGuardia(10, 4, '05:00-08:00', 9)),
    ).rejects.toMatchObject({ codigo: 'TURNO_TRASLAPADO' });
  });

  it('acepta un turno nocturno y uno contiguo en otra estación', async () => {
    const { handler, asignaciones } = preparar({ delGuardia: [cubre(8, '06:00-14:00')] });

    await handler.execute(new AsignarGuardia(10, 4, '14:00-22:00', 9));
    await handler.execute(new AsignarGuardia(10, 4, '22:00-06:00', 9));

    expect(asignaciones.insert.mock.calls).toHaveLength(2);
  });

  it.each(['25:00-06:00', '08:00-08:00', '6-14'])('rechaza el turno %p', async (turno) => {
    const { handler, asignaciones } = preparar();

    await expect(handler.execute(new AsignarGuardia(10, 4, turno, 9))).rejects.toMatchObject({
      codigo: 'TURNO_INVALIDO',
    });
    expect(asignaciones.insert.mock.calls).toHaveLength(0);
  });

  it('rechaza un acceso inexistente', async () => {
    const { handler, publicar } = preparar({ acceso: null });

    await expect(
      handler.execute(new AsignarGuardia(10, 4, '06:00-14:00', 9)),
    ).rejects.toMatchObject({ codigo: 'ACCESO_NO_EXISTE', tipo: 'NO_ENCONTRADO' });
    expect(publicar).not.toHaveBeenCalled();
  });

  it('rechaza un guardia inexistente como dato de la asignación', async () => {
    const { handler, asignaciones } = preparar({ guardiaExiste: false });

    await expect(
      handler.execute(new AsignarGuardia(10, 4, '06:00-14:00', 9)),
    ).rejects.toMatchObject({ codigo: 'GUARDIA_NO_EXISTE', tipo: 'REGLA_NEGOCIO' });
    expect(asignaciones.insert.mock.calls).toHaveLength(0);
  });
});
