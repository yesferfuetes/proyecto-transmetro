import type { EventBus } from '@nestjs/cqrs';
import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import { Linea } from '../../entities/linea.entity';
import { Municipalidad } from '../../entities/municipalidad.entity';
import { LineaRegistrada } from '../../events/eventos-de-red';
import { DatosDeLinea, RegistrarLinea } from '../impl/registrar-linea.command';
import { RegistrarLineaHandler } from './registrar-linea.handler';

const DATOS: DatosDeLinea = {
  codigo: ' l20 ',
  nombre: 'Línea 20',
  municipalidadId: 1,
  estado: 'EN_CONSTRUCCION',
};

interface Preparado {
  handler: RegistrarLineaHandler;
  lineas: RepositorioSimulado<Linea>;
  publicar: jest.Mock;
}

function preparar({ municipalidadExiste = true, codigoExiste = false } = {}): Preparado {
  const unidad = new UnidadDeTrabajoSimulada();
  const municipalidades = unidad.registrar(Municipalidad);
  const lineas = unidad.registrar(Linea);
  municipalidades.existsBy.mockResolvedValue(municipalidadExiste);
  lineas.existsBy.mockResolvedValue(codigoExiste);
  lineas.save.mockImplementation((datos) => Promise.resolve({ ...datos, id: 20 } as Linea));
  const publicar = jest.fn();
  const handler = new RegistrarLineaHandler(unidad, { publish: publicar } as unknown as EventBus);
  return { handler, lineas, publicar };
}

describe('RegistrarLineaHandler', () => {
  it('registra una línea en construcción sin recorrido ni longitud', async () => {
    const { handler, lineas, publicar } = preparar();

    const id = await handler.execute(new RegistrarLinea(DATOS, 9));

    expect(id).toBe(20);
    expect(lineas.save.mock.calls).toContainEqual([
      {
        codigo: 'L20',
        nombre: 'Línea 20',
        municipalidadId: 1,
        estado: 'EN_CONSTRUCCION',
        longitudKm: null,
      },
    ]);
    expect(publicar).toHaveBeenCalledWith(new LineaRegistrada(9, 20, 'L20', 'EN_CONSTRUCCION'));
  });

  it('rechaza un código ya registrado', async () => {
    const { handler, lineas } = preparar({ codigoExiste: true });

    await expect(
      handler.execute(new RegistrarLinea({ ...DATOS, codigo: 'L1' }, 9)),
    ).rejects.toMatchObject({ codigo: 'CODIGO_LINEA_DUPLICADO', tipo: 'CONFLICTO' });
    expect(lineas.existsBy.mock.calls).toContainEqual([{ codigo: 'L1' }]);
    expect(lineas.save.mock.calls).toHaveLength(0);
  });

  it('rechaza registrarla activa porque aún no tiene recorrido', async () => {
    const { handler, lineas } = preparar();

    await expect(
      handler.execute(new RegistrarLinea({ ...DATOS, estado: 'ACTIVA' }, 9)),
    ).rejects.toMatchObject({ codigo: 'RECORRIDO_INSUFICIENTE' });
    expect(lineas.save.mock.calls).toHaveLength(0);
  });

  it.each(['CERRADA', 'activa', ''])('rechaza el estado "%s"', async (estado) => {
    const { handler, lineas } = preparar();

    await expect(
      handler.execute(new RegistrarLinea({ ...DATOS, estado }, 9)),
    ).rejects.toMatchObject({ codigo: 'ESTADO_LINEA_INVALIDO' });
    expect(lineas.save.mock.calls).toHaveLength(0);
  });

  it('rechaza una municipalidad inexistente', async () => {
    const { handler, lineas, publicar } = preparar({ municipalidadExiste: false });

    await expect(handler.execute(new RegistrarLinea(DATOS, 9))).rejects.toMatchObject({
      codigo: 'MUNICIPALIDAD_NO_EXISTE',
    });
    expect(lineas.save.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });
});
