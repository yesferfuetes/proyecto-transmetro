import type { EventBus } from '@nestjs/cqrs';
import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import { Estacion } from '../../entities/estacion.entity';
import { Municipalidad } from '../../entities/municipalidad.entity';
import { EstacionEditada } from '../../events/eventos-de-red';
import { EditarEstacion } from '../impl/editar-estacion.command';
import { EditarEstacionHandler } from './editar-estacion.handler';

const ACTUAL: Estacion = {
  id: 4,
  codigo: 'E4',
  nombre: 'Correos',
  municipalidadId: 1,
  tieneParqueo: false,
  latitud: 14.6,
  longitud: -90.5,
};

interface Preparado {
  handler: EditarEstacionHandler;
  estaciones: RepositorioSimulado<Estacion>;
  publicar: jest.Mock;
}

function preparar(actual: Estacion | null = ACTUAL, municipalidadExiste = true): Preparado {
  const unidad = new UnidadDeTrabajoSimulada();
  const municipalidades = unidad.registrar(Municipalidad);
  const estaciones = unidad.registrar(Estacion);
  municipalidades.existsBy.mockResolvedValue(municipalidadExiste);
  estaciones.findOneBy.mockResolvedValue(actual);
  const publicar = jest.fn();
  const handler = new EditarEstacionHandler(unidad, {
    publish: publicar,
  } as unknown as EventBus);
  return { handler, estaciones, publicar };
}

describe('EditarEstacionHandler', () => {
  it('edita nombre y municipalidad y lo avisa', async () => {
    const { handler, estaciones, publicar } = preparar();

    await handler.execute(new EditarEstacion(4, { nombre: ' Correo ', municipalidadId: 2 }, 9));

    expect(estaciones.update.mock.calls).toContainEqual([
      { id: 4 },
      { nombre: 'Correo', municipalidadId: 2 },
    ]);
    expect(publicar).toHaveBeenCalledWith(new EstacionEditada(9, 4, ['nombre', 'municipalidadId']));
  });

  it('quita las coordenadas con las dos en null', async () => {
    const { handler, estaciones } = preparar();

    await handler.execute(new EditarEstacion(4, { latitud: null, longitud: null }, 9));

    expect(estaciones.update.mock.calls).toContainEqual([
      { id: 4 },
      { latitud: null, longitud: null },
    ]);
  });

  it('rechaza quitar solo una coordenada', async () => {
    const { handler, estaciones } = preparar();

    await expect(
      handler.execute(new EditarEstacion(4, { latitud: null }, 9)),
    ).rejects.toMatchObject({ codigo: 'COORDENADAS_INVALIDAS' });
    expect(estaciones.update.mock.calls).toHaveLength(0);
  });

  it('rechaza una latitud fuera de rango', async () => {
    const { handler } = preparar();

    await expect(handler.execute(new EditarEstacion(4, { latitud: 95 }, 9))).rejects.toMatchObject({
      codigo: 'COORDENADAS_INVALIDAS',
    });
  });

  it('rechaza una municipalidad inexistente', async () => {
    const { handler, estaciones } = preparar(ACTUAL, false);

    await expect(
      handler.execute(new EditarEstacion(4, { municipalidadId: 99 }, 9)),
    ).rejects.toMatchObject({ codigo: 'MUNICIPALIDAD_NO_EXISTE', tipo: 'REGLA_NEGOCIO' });
    expect(estaciones.update.mock.calls).toHaveLength(0);
  });

  it('rechaza una estación inexistente', async () => {
    const { handler } = preparar(null);

    await expect(handler.execute(new EditarEstacion(99, { nombre: 'X' }, 9))).rejects.toMatchObject(
      { codigo: 'ESTACION_NO_EXISTE', tipo: 'NO_ENCONTRADO' },
    );
  });
});
