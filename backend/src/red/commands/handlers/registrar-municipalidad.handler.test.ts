import type { EventBus } from '@nestjs/cqrs';
import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import { Municipalidad } from '../../entities/municipalidad.entity';
import { MunicipalidadRegistrada } from '../../events/eventos-de-red';
import { RegistrarMunicipalidad } from '../impl/registrar-municipalidad.command';
import { RegistrarMunicipalidadHandler } from './registrar-municipalidad.handler';

interface Preparado {
  handler: RegistrarMunicipalidadHandler;
  municipalidades: RepositorioSimulado<Municipalidad>;
  publicar: jest.Mock;
}

function preparar(registradas: Pick<Municipalidad, 'id' | 'nombre'>[]): Preparado {
  const unidad = new UnidadDeTrabajoSimulada();
  const municipalidades = unidad.registrar(Municipalidad);
  municipalidades.find.mockResolvedValue(registradas as Municipalidad[]);
  municipalidades.save.mockImplementation((datos) =>
    Promise.resolve({ ...datos, id: 3 } as Municipalidad),
  );
  const publicar = jest.fn();
  const handler = new RegistrarMunicipalidadHandler(unidad, {
    publish: publicar,
  } as unknown as EventBus);
  return { handler, municipalidades, publicar };
}

describe('RegistrarMunicipalidadHandler', () => {
  it('registra la municipalidad y avisa a la auditoría', async () => {
    const { handler, municipalidades, publicar } = preparar([{ id: 1, nombre: 'Guatemala' }]);

    const id = await handler.execute(
      new RegistrarMunicipalidad(' Mixco ', 'Guatemala', '2026-01-15', 9),
    );

    expect(id).toBe(3);
    expect(municipalidades.save.mock.calls).toContainEqual([
      {
        nombre: 'Mixco',
        departamento: 'Guatemala',
        fechaIncorporacion: '2026-01-15',
      },
    ]);
    expect(publicar).toHaveBeenCalledWith(new MunicipalidadRegistrada(9, 3, 'Mixco'));
  });

  it.each(['Guatemala', 'guatemala', '  GUATEMALA '])(
    'rechaza "%s" porque el nombre ya existe sin distinguir mayúsculas',
    async (nombre) => {
      const { handler, municipalidades, publicar } = preparar([{ id: 1, nombre: 'Guatemala' }]);

      await expect(
        handler.execute(new RegistrarMunicipalidad(nombre, null, null, 9)),
      ).rejects.toMatchObject({ codigo: 'MUNICIPALIDAD_DUPLICADA', tipo: 'CONFLICTO' });
      expect(municipalidades.save.mock.calls).toHaveLength(0);
      expect(publicar).not.toHaveBeenCalled();
    },
  );
});
