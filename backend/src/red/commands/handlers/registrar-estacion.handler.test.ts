import type { EventBus } from '@nestjs/cqrs';
import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import { Estacion } from '../../entities/estacion.entity';
import { Municipalidad } from '../../entities/municipalidad.entity';
import { EstacionRegistrada } from '../../events/eventos-de-red';
import { DatosDeEstacion, RegistrarEstacion } from '../impl/registrar-estacion.command';
import { RegistrarEstacionHandler } from './registrar-estacion.handler';

const DATOS: DatosDeEstacion = {
  codigo: 'e1',
  nombre: ' Plaza Barrios ',
  municipalidadId: 1,
  tieneParqueo: true,
  latitud: null,
  longitud: null,
};

interface Preparado {
  handler: RegistrarEstacionHandler;
  estaciones: RepositorioSimulado<Estacion>;
  publicar: jest.Mock;
}

function preparar({ municipalidadExiste = true, codigoExiste = false } = {}): Preparado {
  const unidad = new UnidadDeTrabajoSimulada();
  const municipalidades = unidad.registrar(Municipalidad);
  const estaciones = unidad.registrar(Estacion);
  municipalidades.existsBy.mockResolvedValue(municipalidadExiste);
  estaciones.existsBy.mockResolvedValue(codigoExiste);
  estaciones.save.mockImplementation((datos) => Promise.resolve({ ...datos, id: 5 } as Estacion));
  const publicar = jest.fn();
  const handler = new RegistrarEstacionHandler(unidad, {
    publish: publicar,
  } as unknown as EventBus);
  return { handler, estaciones, publicar };
}

describe('RegistrarEstacionHandler', () => {
  it('registra la estación con el código normalizado; queda sin línea', async () => {
    const { handler, estaciones, publicar } = preparar();

    const id = await handler.execute(
      new RegistrarEstacion({ ...DATOS, latitud: 14.6349, longitud: -90.5069 }, 9),
    );

    expect(id).toBe(5);
    expect(estaciones.save.mock.calls).toContainEqual([
      {
        codigo: 'E1',
        nombre: 'Plaza Barrios',
        municipalidadId: 1,
        tieneParqueo: true,
        latitud: 14.6349,
        longitud: -90.5069,
      },
    ]);
    expect(publicar).toHaveBeenCalledWith(new EstacionRegistrada(9, 5, 'E1'));
  });

  it('rechaza una municipalidad inexistente y no crea nada', async () => {
    const { handler, estaciones, publicar } = preparar({ municipalidadExiste: false });

    await expect(handler.execute(new RegistrarEstacion(DATOS, 9))).rejects.toMatchObject({
      codigo: 'MUNICIPALIDAD_NO_EXISTE',
      tipo: 'REGLA_NEGOCIO',
    });
    expect(estaciones.save.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('rechaza el código e1 cuando ya existe E1', async () => {
    const { handler, estaciones } = preparar({ codigoExiste: true });

    await expect(handler.execute(new RegistrarEstacion(DATOS, 9))).rejects.toMatchObject({
      codigo: 'CODIGO_ESTACION_DUPLICADO',
      tipo: 'CONFLICTO',
    });
    expect(estaciones.existsBy.mock.calls).toContainEqual([{ codigo: 'E1' }]);
    expect(estaciones.save.mock.calls).toHaveLength(0);
  });

  it.each([
    ['solo latitud', 14.6, null],
    ['solo longitud', null, -90.5],
    ['latitud 95', 95, -90.5],
    ['longitud 181', 14.6, 181],
  ])('rechaza coordenadas con %s', async (_caso, latitud, longitud) => {
    const { handler, estaciones } = preparar();

    await expect(
      handler.execute(new RegistrarEstacion({ ...DATOS, latitud, longitud }, 9)),
    ).rejects.toMatchObject({ codigo: 'COORDENADAS_INVALIDAS' });
    expect(estaciones.save.mock.calls).toHaveLength(0);
  });

  it('acepta las coordenadas en los límites', async () => {
    const { handler, estaciones } = preparar();

    await handler.execute(new RegistrarEstacion({ ...DATOS, latitud: -90, longitud: 180 }, 9));

    expect(estaciones.save.mock.calls.length).toBeGreaterThan(0);
  });
});
