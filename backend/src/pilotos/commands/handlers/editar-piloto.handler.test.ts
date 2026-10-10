import type { EventBus } from '@nestjs/cqrs';
import { QueryFailedError } from 'typeorm';
import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import { Piloto } from '../../entities/piloto.entity';
import { PilotoEditado } from '../../events/eventos-de-pilotos';
import type { DatosDePiloto } from '../../services/validaciones';
import { EditarPiloto } from '../impl/editar-piloto.command';
import { EditarPilotoHandler } from './editar-piloto.handler';

const ACTUAL: Piloto = {
  id: 7,
  nombre: 'Carlos Pérez',
  dpi: '1234 56789 0101',
  direccionResidencia: 'Zona 1',
  telefono: '5555-1234',
  email: null,
  historialEducativo: 'Diversificado',
  busId: 5,
};

const DATOS: DatosDePiloto = {
  nombre: 'Carlos Pérez',
  dpi: '1234 56789 0101',
  direccionResidencia: 'Zona 1',
  telefono: '5555-1234',
  correo: null,
  historialEducativo: 'Diversificado',
};

function preparar(
  actual: Piloto | null = ACTUAL,
  dpiAjeno = false,
): { handler: EditarPilotoHandler; pilotos: RepositorioSimulado<Piloto>; publicar: jest.Mock } {
  const unidad = new UnidadDeTrabajoSimulada();
  const pilotos = unidad.registrar(Piloto);
  pilotos.findOneBy.mockResolvedValue(actual);
  pilotos.existsBy.mockResolvedValue(dpiAjeno);
  const publicar = jest.fn();
  const handler = new EditarPilotoHandler(unidad, { publish: publicar } as unknown as EventBus);
  return { handler, pilotos, publicar };
}

async function codigoRechazado(
  handler: EditarPilotoHandler,
  comando: EditarPiloto,
): Promise<string> {
  try {
    await handler.execute(comando);
  } catch (error) {
    return (error as { codigo: string }).codigo;
  }
  return 'NO_RECHAZO';
}

describe('EditarPilotoHandler', () => {
  it('cambia los campos y avisa cuáles, sin valores', async () => {
    const { handler, pilotos, publicar } = preparar();

    await handler.execute(
      new EditarPiloto(
        7,
        {
          ...DATOS,
          telefono: '55559999',
          correo: 'c@correo.com',
          historialEducativo: 'Universidad',
        },
        9,
      ),
    );

    expect(pilotos.update.mock.calls).toContainEqual([
      { id: 7 },
      {
        nombre: 'Carlos Pérez',
        dpi: '1234 56789 0101',
        direccionResidencia: 'Zona 1',
        telefono: '5555-9999',
        email: 'c@correo.com',
        historialEducativo: 'Universidad',
      },
    ]);
    expect(publicar).toHaveBeenCalledWith(
      new PilotoEditado(9, 7, ['telefono', 'correo', 'historialEducativo']),
    );
    const evento = (publicar.mock.calls[0] as [PilotoEditado])[0];
    expect(JSON.stringify(evento)).not.toMatch(/9999|correo\.com|Universidad/);
  });

  it('sin cambios no escribe ni avisa', async () => {
    const { handler, pilotos, publicar } = preparar();

    await handler.execute(new EditarPiloto(7, { ...DATOS, dpi: '1234567890101' }, 9));

    expect(pilotos.update.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('el DPI propio no cuenta como duplicado', async () => {
    const { handler, pilotos } = preparar();

    await handler.execute(new EditarPiloto(7, { ...DATOS, nombre: 'Carlos P.' }, 9));

    const [donde] = pilotos.existsBy.mock.calls[0] as [{ dpi: string; id: unknown }];
    expect(donde.dpi).toBe('1234 56789 0101');
    expect(donde.id).toMatchObject({ _type: 'not', _value: 7 });
  });

  it('rechaza el DPI de otro piloto', async () => {
    const { handler, pilotos, publicar } = preparar(ACTUAL, true);

    await expect(
      codigoRechazado(handler, new EditarPiloto(7, { ...DATOS, dpi: '9999 99999 9999' }, 9)),
    ).resolves.toBe('DPI_PILOTO_DUPLICADO');
    expect(pilotos.update.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('traduce la violación de unicidad de la base a DPI_PILOTO_DUPLICADO', async () => {
    const { handler, pilotos } = preparar();
    pilotos.update.mockRejectedValue(
      new QueryFailedError('UPDATE', [], Object.assign(new Error('duplicado'), { code: '23505' })),
    );

    await expect(
      codigoRechazado(handler, new EditarPiloto(7, { ...DATOS, dpi: '9999 99999 9999' }, 9)),
    ).resolves.toBe('DPI_PILOTO_DUPLICADO');
  });

  it.each([
    ['DPI de 12 dígitos', { dpi: '123456789012' }, 'DPI_INVALIDO'],
    ['nombre vacío', { nombre: '' }, 'NOMBRE_INVALIDO'],
    ['sin dirección', { direccionResidencia: '' }, 'DATOS_DE_RESIDENCIA_REQUERIDOS'],
    ['sin historial', { historialEducativo: '' }, 'HISTORIAL_EDUCATIVO_REQUERIDO'],
    ['sin teléfono', { telefono: '' }, 'DATOS_DE_COMUNICACION_REQUERIDOS'],
    ['teléfono de 7 dígitos', { telefono: '5555123' }, 'TELEFONO_INVALIDO'],
    ['correo sin arroba', { correo: 'c.correo.com' }, 'CORREO_INVALIDO'],
  ])('rechaza %s y no cambia nada', async (_caso, cambio, codigo) => {
    const { handler, pilotos, publicar } = preparar();

    await expect(
      codigoRechazado(handler, new EditarPiloto(7, { ...DATOS, ...cambio }, 9)),
    ).resolves.toBe(codigo);
    expect(pilotos.update.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('rechaza un piloto inexistente', async () => {
    const { handler, pilotos, publicar } = preparar(null);

    await expect(codigoRechazado(handler, new EditarPiloto(99, DATOS, 9))).resolves.toBe(
      'PILOTO_NO_EXISTE',
    );
    expect(pilotos.update.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('no toca el bus del piloto', async () => {
    const { handler, pilotos } = preparar();

    await handler.execute(new EditarPiloto(7, { ...DATOS, telefono: '5555-0000' }, 9));

    expect(pilotos.update.mock.calls[0]?.[1]).not.toHaveProperty('busId');
  });
});
