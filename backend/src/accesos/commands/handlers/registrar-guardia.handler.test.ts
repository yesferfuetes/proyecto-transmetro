import type { EventBus } from '@nestjs/cqrs';
import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import { GuardiaSeguridad } from '../../entities/guardia-seguridad.entity';
import { GuardiaRegistrado } from '../../events/eventos-de-accesos';
import { DatosDeGuardia, RegistrarGuardia } from '../impl/registrar-guardia.command';
import { RegistrarGuardiaHandler } from './registrar-guardia.handler';

const DATOS: DatosDeGuardia = {
  nombre: ' Carlos Pérez ',
  dpi: '1234567890101',
  telefono: '55551234',
};

interface Preparado {
  handler: RegistrarGuardiaHandler;
  guardias: RepositorioSimulado<GuardiaSeguridad>;
  publicar: jest.Mock;
}

function preparar(dpiExiste = false): Preparado {
  const unidad = new UnidadDeTrabajoSimulada();
  const guardias = unidad.registrar(GuardiaSeguridad);
  guardias.existsBy.mockResolvedValue(dpiExiste);
  guardias.save.mockImplementation((datos) =>
    Promise.resolve({ ...datos, id: 12 } as GuardiaSeguridad),
  );
  const publicar = jest.fn();
  const handler = new RegistrarGuardiaHandler(unidad, {
    publish: publicar,
  } as unknown as EventBus);
  return { handler, guardias, publicar };
}

describe('RegistrarGuardiaHandler', () => {
  it('registra al guardia con DPI y teléfono normalizados', async () => {
    const { handler, guardias, publicar } = preparar();

    const id = await handler.execute(new RegistrarGuardia(DATOS, 9));

    expect(id).toBe(12);
    expect(guardias.save.mock.calls).toEqual([
      [{ nombre: 'Carlos Pérez', dpi: '1234 56789 0101', telefono: '5555-1234' }],
    ]);
    expect(publicar).toHaveBeenCalledWith(new GuardiaRegistrado(9, 12));
  });

  it('acepta un guardia sin teléfono', async () => {
    const { handler, guardias } = preparar();

    await handler.execute(new RegistrarGuardia({ ...DATOS, telefono: null }, 9));

    expect(guardias.save.mock.calls).toContainEqual([expect.objectContaining({ telefono: null })]);
  });

  it('rechaza un DPI que ya existe aunque se escriba distinto', async () => {
    const { handler, guardias, publicar } = preparar(true);

    await expect(
      handler.execute(new RegistrarGuardia({ ...DATOS, dpi: '1234 56789 0101' }, 9)),
    ).rejects.toMatchObject({ codigo: 'DPI_GUARDIA_DUPLICADO', tipo: 'CONFLICTO' });
    expect(guardias.existsBy.mock.calls).toEqual([[{ dpi: '1234 56789 0101' }]]);
    expect(guardias.save.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('rechaza un DPI de 12 dígitos', async () => {
    const { handler, guardias, publicar } = preparar();

    await expect(
      handler.execute(new RegistrarGuardia({ ...DATOS, dpi: '123456789010' }, 9)),
    ).rejects.toMatchObject({ codigo: 'DPI_INVALIDO', tipo: 'REGLA_NEGOCIO' });
    expect(guardias.save.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('rechaza el teléfono 5555-555', async () => {
    const { handler, guardias } = preparar();

    await expect(
      handler.execute(new RegistrarGuardia({ ...DATOS, telefono: '5555-555' }, 9)),
    ).rejects.toMatchObject({ codigo: 'TELEFONO_INVALIDO', tipo: 'REGLA_NEGOCIO' });
    expect(guardias.save.mock.calls).toHaveLength(0);
  });
});
