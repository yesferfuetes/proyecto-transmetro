import type { EventBus } from '@nestjs/cqrs';
import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import type { EstacionResumen } from '../../../shared/contratos/red';
import { Parqueo } from '../../entities/parqueo.entity';
import { ParqueoRegistrado } from '../../events/eventos-de-flota';
import type { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { RegistrarParqueo } from '../impl/registrar-parqueo.command';
import { RegistrarParqueoHandler } from './registrar-parqueo.handler';

const ESTACION: EstacionResumen = {
  id: 3,
  codigo: 'E3',
  nombre: 'Centra Sur',
  municipalidadId: 1,
  tieneParqueo: true,
};

function preparar(
  estacion: EstacionResumen | null,
  codigoExistente = false,
): {
  handler: RegistrarParqueoHandler;
  parqueos: RepositorioSimulado<Parqueo>;
  publicar: jest.Mock;
} {
  const unidad = new UnidadDeTrabajoSimulada();
  const parqueos = unidad.registrar(Parqueo);
  parqueos.existsBy.mockResolvedValue(codigoExistente);
  parqueos.save.mockResolvedValue({ id: 11 } as Parqueo);
  const red = { obtenerEstacion: jest.fn().mockResolvedValue(estacion) } as unknown as RedAdapter;
  const publicar = jest.fn();
  const handler = new RegistrarParqueoHandler(unidad, red, {
    publish: publicar,
  } as unknown as EventBus);
  return { handler, parqueos, publicar };
}

const DATOS = { estacionId: 3, codigo: ' p1 ', capacidadVehiculos: 30 };

describe('RegistrarParqueoHandler', () => {
  it('registra el parqueo con el código normalizado y avisa', async () => {
    const { handler, parqueos, publicar } = preparar(ESTACION);

    await expect(handler.execute(new RegistrarParqueo(DATOS, 9))).resolves.toBe(11);

    expect(parqueos.existsBy.mock.calls).toContainEqual([{ estacionId: 3, codigo: 'P1' }]);
    expect(parqueos.save.mock.calls).toContainEqual([
      {
        estacionId: 3,
        codigo: 'P1',
        capacidadVehiculos: 30,
      },
    ]);
    expect(publicar).toHaveBeenCalledWith(new ParqueoRegistrado(9, 11, 3, 'P1'));
  });

  it('rechaza una estación sin la marca de parqueo', async () => {
    const { handler, parqueos } = preparar({ ...ESTACION, tieneParqueo: false });

    await expect(handler.execute(new RegistrarParqueo(DATOS, 9))).rejects.toMatchObject({
      codigo: 'ESTACION_SIN_PARQUEO',
    });
    expect(parqueos.save.mock.calls).toHaveLength(0);
  });

  it('rechaza una estación inexistente', async () => {
    const { handler } = preparar(null);

    await expect(handler.execute(new RegistrarParqueo(DATOS, 9))).rejects.toMatchObject({
      codigo: 'ESTACION_NO_EXISTE',
    });
  });

  it('rechaza un código ya usado en la estación', async () => {
    const { handler, parqueos, publicar } = preparar(ESTACION, true);

    await expect(handler.execute(new RegistrarParqueo(DATOS, 9))).rejects.toMatchObject({
      codigo: 'CODIGO_PARQUEO_DUPLICADO',
    });
    expect(parqueos.save.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it.each([0, -1, 2.5])('rechaza la capacidad %p', async (capacidadVehiculos) => {
    const { handler, parqueos } = preparar(ESTACION);

    await expect(
      handler.execute(new RegistrarParqueo({ ...DATOS, capacidadVehiculos }, 9)),
    ).rejects.toMatchObject({ codigo: 'CAPACIDAD_INVALIDA' });
    expect(parqueos.save.mock.calls).toHaveLength(0);
  });
});
