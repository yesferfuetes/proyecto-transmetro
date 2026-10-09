import type { EventBus } from '@nestjs/cqrs';
import { Not } from 'typeorm';
import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import { GuardiaSeguridad } from '../../entities/guardia-seguridad.entity';
import { GuardiaEditado } from '../../events/eventos-de-accesos';
import { DatosDeGuardia } from '../impl/registrar-guardia.command';
import { EditarGuardia } from '../impl/editar-guardia.command';
import { EditarGuardiaHandler } from './editar-guardia.handler';

const ACTUAL: GuardiaSeguridad = {
  id: 12,
  nombre: 'Carlos Pérez',
  dpi: '1234 56789 0101',
  telefono: '5555-1234',
};

const DATOS: DatosDeGuardia = {
  nombre: 'Carlos Pérez',
  dpi: '1234567890101',
  telefono: '5555-1234',
};

interface Preparado {
  handler: EditarGuardiaHandler;
  guardias: RepositorioSimulado<GuardiaSeguridad>;
  publicar: jest.Mock;
}

function preparar(actual: GuardiaSeguridad | null = ACTUAL, dpiDeOtro = false): Preparado {
  const unidad = new UnidadDeTrabajoSimulada();
  const guardias = unidad.registrar(GuardiaSeguridad);
  guardias.findOneBy.mockResolvedValue(actual);
  guardias.existsBy.mockResolvedValue(dpiDeOtro);
  const publicar = jest.fn();
  const handler = new EditarGuardiaHandler(unidad, { publish: publicar } as unknown as EventBus);
  return { handler, guardias, publicar };
}

describe('EditarGuardiaHandler', () => {
  it('guarda los cambios y avisa solo los nombres de los campos, sin el DPI', async () => {
    const { handler, guardias, publicar } = preparar();

    await handler.execute(
      new EditarGuardia(12, { nombre: 'Carlos Pérez', dpi: '9999 99999 9999', telefono: null }, 9),
    );

    expect(guardias.update.mock.calls).toEqual([
      [{ id: 12 }, { nombre: 'Carlos Pérez', dpi: '9999 99999 9999', telefono: null }],
    ]);
    const evento = new GuardiaEditado(9, 12, ['dpi', 'telefono']);
    expect(publicar).toHaveBeenCalledWith(evento);
    expect(evento.resumen).toEqual({ campos: 'dpi,telefono' });
  });

  it('no cuenta como cambio el DPI escrito sin espacios', async () => {
    const { handler, publicar } = preparar();

    await handler.execute(new EditarGuardia(12, DATOS, 9));

    expect(publicar).toHaveBeenCalledWith(new GuardiaEditado(9, 12, []));
  });

  it('rechaza el DPI de otro guardia, sin contar al propio', async () => {
    const { handler, guardias, publicar } = preparar(ACTUAL, true);

    await expect(handler.execute(new EditarGuardia(12, DATOS, 9))).rejects.toMatchObject({
      codigo: 'DPI_GUARDIA_DUPLICADO',
      tipo: 'CONFLICTO',
    });
    expect(guardias.existsBy.mock.calls).toEqual([[{ dpi: '1234 56789 0101', id: Not(12) }]]);
    expect(guardias.update.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('rechaza un DPI de 12 dígitos y un teléfono de 7', async () => {
    const { handler, guardias } = preparar();

    await expect(
      handler.execute(new EditarGuardia(12, { ...DATOS, dpi: '123456789010' }, 9)),
    ).rejects.toMatchObject({ codigo: 'DPI_INVALIDO' });
    await expect(
      handler.execute(new EditarGuardia(12, { ...DATOS, telefono: '5555-555' }, 9)),
    ).rejects.toMatchObject({ codigo: 'TELEFONO_INVALIDO' });
    expect(guardias.update.mock.calls).toHaveLength(0);
  });

  it('rechaza un guardia inexistente', async () => {
    const { handler, publicar } = preparar(null);

    await expect(handler.execute(new EditarGuardia(12, DATOS, 9))).rejects.toMatchObject({
      codigo: 'GUARDIA_NO_EXISTE',
      tipo: 'NO_ENCONTRADO',
    });
    expect(publicar).not.toHaveBeenCalled();
  });
});
