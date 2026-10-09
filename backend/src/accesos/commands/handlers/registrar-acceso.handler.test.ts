import type { EventBus } from '@nestjs/cqrs';
import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import { AccesoGuardia } from '../../entities/acceso-guardia.entity';
import { Acceso } from '../../entities/acceso.entity';
import { GuardiaSeguridad } from '../../entities/guardia-seguridad.entity';
import { AccesoRegistrado } from '../../events/eventos-de-accesos';
import type { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { DatosDeAcceso, RegistrarAcceso } from '../impl/registrar-acceso.command';
import { RegistrarAccesoHandler } from './registrar-acceso.handler';

const DATOS: DatosDeAcceso = {
  estacionId: 3,
  codigo: ' c ',
  nombre: ' Norte ',
  guardiaId: 4,
  turno: '6:00-14:00',
};

interface Preparado {
  handler: RegistrarAccesoHandler;
  unidad: UnidadDeTrabajoSimulada;
  accesos: RepositorioSimulado<Acceso>;
  asignaciones: RepositorioSimulado<AccesoGuardia>;
  guardias: RepositorioSimulado<GuardiaSeguridad>;
  publicar: jest.Mock;
}

interface Opciones {
  estacionExiste?: boolean;
  codigoExiste?: (estacionId: number, codigo: string) => boolean;
  guardiaExiste?: boolean;
  delGuardia?: AccesoGuardia[];
}

function preparar({
  estacionExiste = true,
  codigoExiste = () => false,
  guardiaExiste = true,
  delGuardia = [],
}: Opciones = {}): Preparado {
  const unidad = new UnidadDeTrabajoSimulada();
  const accesos = unidad.registrar(Acceso);
  const asignaciones = unidad.registrar(AccesoGuardia);
  const guardias = unidad.registrar(GuardiaSeguridad);
  accesos.existsBy.mockImplementation((donde) =>
    Promise.resolve(codigoExiste((donde as Acceso).estacionId, (donde as Acceso).codigo)),
  );
  accesos.save.mockImplementation((datos) => Promise.resolve({ ...datos, id: 7 } as Acceso));
  guardias.findOne.mockResolvedValue(guardiaExiste ? ({ id: 4 } as GuardiaSeguridad) : null);
  asignaciones.find.mockResolvedValue(delGuardia);
  asignaciones.insert.mockResolvedValue({} as never);
  const red = {
    obtenerEstacion: jest.fn((id: number) =>
      Promise.resolve(estacionExiste ? { id, codigo: `E${id}`, nombre: `Estación ${id}` } : null),
    ),
  } as unknown as RedAdapter;
  const publicar = jest.fn();
  const handler = new RegistrarAccesoHandler(unidad, red, {
    publish: publicar,
  } as unknown as EventBus);
  return { handler, unidad, accesos, asignaciones, guardias, publicar };
}

function asignacionEn(estacionId: number, turno: string): AccesoGuardia {
  return { accesoId: 50, guardiaId: 4, turno, acceso: { id: 50, estacionId } as Acceso };
}

describe('RegistrarAccesoHandler', () => {
  it('crea el acceso y su primera asignación en una sola transacción', async () => {
    const { handler, unidad, accesos, asignaciones, publicar } = preparar();

    const id = await handler.execute(new RegistrarAcceso(DATOS, 9));

    expect(id).toBe(7);
    expect(unidad.ejecuciones).toBe(1);
    expect(accesos.save.mock.calls).toEqual([[{ estacionId: 3, codigo: 'C', nombre: 'Norte' }]]);
    expect(asignaciones.insert.mock.calls).toEqual([
      [{ accesoId: 7, guardiaId: 4, turno: '06:00-14:00' }],
    ]);
    expect(publicar).toHaveBeenCalledWith(new AccesoRegistrado(9, 7, 3, 'C', 4, '06:00-14:00'));
  });

  it('bloquea la fila del guardia antes de leer sus turnos', async () => {
    const { handler, guardias } = preparar();

    await handler.execute(new RegistrarAcceso(DATOS, 9));

    expect(guardias.findOne.mock.calls).toEqual([
      [{ where: { id: 4 }, lock: { mode: 'pessimistic_write' } }],
    ]);
  });

  it('acepta un turno nocturno', async () => {
    const { handler, asignaciones } = preparar();

    await handler.execute(new RegistrarAcceso({ ...DATOS, turno: '22:00-06:00' }, 9));

    expect(asignaciones.insert.mock.calls).toContainEqual([
      { accesoId: 7, guardiaId: 4, turno: '22:00-06:00' },
    ]);
  });

  it('rechaza un acceso sin guardia y no crea nada', async () => {
    const { handler, unidad, accesos, asignaciones, publicar } = preparar();

    await expect(
      handler.execute(new RegistrarAcceso({ ...DATOS, guardiaId: null }, 9)),
    ).rejects.toMatchObject({ codigo: 'ACCESO_SIN_GUARDIA', tipo: 'REGLA_NEGOCIO' });
    expect(unidad.ejecuciones).toBe(0);
    expect(accesos.save.mock.calls).toHaveLength(0);
    expect(asignaciones.insert.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('rechaza el código "a " cuando la estación ya tiene el acceso A', async () => {
    const { handler, accesos, publicar } = preparar({
      codigoExiste: (estacionId, codigo) => estacionId === 3 && codigo === 'A',
    });

    await expect(
      handler.execute(new RegistrarAcceso({ ...DATOS, codigo: 'a ' }, 9)),
    ).rejects.toMatchObject({ codigo: 'CODIGO_ACCESO_DUPLICADO', tipo: 'CONFLICTO' });
    expect(accesos.save.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('acepta el mismo código en otra estación', async () => {
    const { handler, accesos } = preparar({
      codigoExiste: (estacionId, codigo) => estacionId === 1 && codigo === 'A',
    });

    await handler.execute(new RegistrarAcceso({ ...DATOS, codigo: 'A' }, 9));

    expect(accesos.save.mock.calls).toHaveLength(1);
  });

  it('rechaza una estación inexistente', async () => {
    const { handler, unidad, publicar } = preparar({ estacionExiste: false });

    await expect(handler.execute(new RegistrarAcceso(DATOS, 9))).rejects.toMatchObject({
      codigo: 'ESTACION_NO_EXISTE',
      tipo: 'REGLA_NEGOCIO',
    });
    expect(unidad.ejecuciones).toBe(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('rechaza un guardia inexistente y no crea nada', async () => {
    const { handler, accesos, publicar } = preparar({ guardiaExiste: false });

    await expect(handler.execute(new RegistrarAcceso(DATOS, 9))).rejects.toMatchObject({
      codigo: 'GUARDIA_NO_EXISTE',
      tipo: 'REGLA_NEGOCIO',
    });
    expect(accesos.save.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it.each(['25:00-06:00', '08:00-08:00', '6-14', ''])('rechaza el turno %p', async (turno) => {
    const { handler, accesos, publicar } = preparar();

    await expect(
      handler.execute(new RegistrarAcceso({ ...DATOS, turno }, 9)),
    ).rejects.toMatchObject({ codigo: 'TURNO_INVALIDO', tipo: 'REGLA_NEGOCIO' });
    expect(accesos.save.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('rechaza un turno que se traslapa con otro del guardia en otra estación', async () => {
    const { handler, accesos, asignaciones, publicar } = preparar({
      delGuardia: [asignacionEn(9, '06:00-14:00')],
    });

    await expect(
      handler.execute(new RegistrarAcceso({ ...DATOS, turno: '10:00-18:00' }, 9)),
    ).rejects.toMatchObject({ codigo: 'TURNO_TRASLAPADO', tipo: 'REGLA_NEGOCIO' });
    expect(accesos.save.mock.calls).toHaveLength(0);
    expect(asignaciones.insert.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('acepta el mismo turno que el guardia ya cubre en otro acceso de la misma estación', async () => {
    const { handler, accesos } = preparar({ delGuardia: [asignacionEn(3, '06:00-14:00')] });

    await handler.execute(new RegistrarAcceso({ ...DATOS, turno: '06:00-14:00' }, 9));

    expect(accesos.save.mock.calls).toHaveLength(1);
  });
});
