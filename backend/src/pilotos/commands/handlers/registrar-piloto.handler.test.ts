import type { EventBus } from '@nestjs/cqrs';
import { QueryFailedError } from 'typeorm';
import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import type { BusResumen, EstadoDeBus } from '../../../shared/contratos/flota';
import { Piloto } from '../../entities/piloto.entity';
import { PilotoRegistrado } from '../../events/eventos-de-pilotos';
import type { FlotaAdapter } from '../../infrastructure/adapters/flota.adapter';
import type { DatosDePiloto } from '../../services/validaciones';
import { RegistrarPiloto } from '../impl/registrar-piloto.command';
import { RegistrarPilotoHandler } from './registrar-piloto.handler';

interface Escenario {
  bus?: Partial<BusResumen> | null;
  dpiExistente?: boolean;
}

function bus(estado: EstadoDeBus): BusResumen {
  return { id: 5, placa: 'TM-0005', capacidadMax: 100, lineaId: 3, estado };
}

function preparar(escenario: Escenario = {}): {
  handler: RegistrarPilotoHandler;
  pilotos: RepositorioSimulado<Piloto>;
  publicar: jest.Mock;
  obtenerBus: jest.Mock;
} {
  const unidad = new UnidadDeTrabajoSimulada();
  const pilotos = unidad.registrar(Piloto);
  pilotos.existsBy.mockResolvedValue(escenario.dpiExistente ?? false);
  pilotos.save.mockResolvedValue({ id: 42 } as Piloto);
  const obtenerBus = jest
    .fn()
    .mockResolvedValue(escenario.bus === undefined ? bus('ACTIVO') : escenario.bus);
  const publicar = jest.fn();
  const handler = new RegistrarPilotoHandler(
    unidad,
    { obtenerBus } as unknown as FlotaAdapter,
    { publish: publicar } as unknown as EventBus,
  );
  return { handler, pilotos, publicar, obtenerBus };
}

const DATOS: DatosDePiloto = {
  nombre: 'Carlos Pérez',
  dpi: '1234 56789 0101',
  direccionResidencia: 'Zona 1, Guatemala',
  telefono: '5555-1234',
  correo: 'carlos@correo.com',
  historialEducativo: 'Perito contador',
};

const GUARDADO = {
  nombre: 'Carlos Pérez',
  dpi: '1234 56789 0101',
  direccionResidencia: 'Zona 1, Guatemala',
  telefono: '5555-1234',
  email: 'carlos@correo.com',
  historialEducativo: 'Perito contador',
};

async function codigoRechazado(
  handler: RegistrarPilotoHandler,
  comando: RegistrarPiloto,
): Promise<string> {
  try {
    await handler.execute(comando);
  } catch (error) {
    return (error as { codigo: string }).codigo;
  }
  return 'NO_RECHAZO';
}

describe('RegistrarPilotoHandler', () => {
  it('registra un piloto con bus y avisa', async () => {
    const { handler, pilotos, publicar } = preparar();

    await expect(handler.execute(new RegistrarPiloto(DATOS, 5, 9))).resolves.toBe(42);

    expect(pilotos.save.mock.calls).toContainEqual([{ ...GUARDADO, busId: 5 }]);
    expect(publicar).toHaveBeenCalledWith(new PilotoRegistrado(9, 42, 5));
  });

  it('registra un piloto sin bus y no consulta la flota', async () => {
    const { handler, pilotos, obtenerBus } = preparar();

    await handler.execute(new RegistrarPiloto(DATOS, null, 9));

    expect(pilotos.save.mock.calls[0]?.[0]).toMatchObject({ busId: null });
    expect(obtenerBus).not.toHaveBeenCalled();
  });

  it('normaliza el DPI, el teléfono y el nombre antes de guardar', async () => {
    const { handler, pilotos } = preparar();

    await handler.execute(
      new RegistrarPiloto(
        { ...DATOS, nombre: ' Carlos Pérez ', dpi: '1234567890101', telefono: '55551234' },
        null,
        9,
      ),
    );

    expect(pilotos.existsBy.mock.calls).toContainEqual([{ dpi: '1234 56789 0101' }]);
    expect(pilotos.save.mock.calls[0]?.[0]).toMatchObject({
      nombre: 'Carlos Pérez',
      dpi: '1234 56789 0101',
      telefono: '5555-1234',
    });
  });

  it('guarda el correo vacío como nulo', async () => {
    const { handler, pilotos } = preparar();

    await handler.execute(new RegistrarPiloto({ ...DATOS, correo: null }, null, 9));

    expect(pilotos.save.mock.calls[0]?.[0]).toMatchObject({ email: null });
  });

  it.each([
    ['nombre vacío', { nombre: '  ' }, 'NOMBRE_INVALIDO'],
    ['nombre de 151', { nombre: 'x'.repeat(151) }, 'NOMBRE_INVALIDO'],
    ['DPI de 12 dígitos', { dpi: '123456789012' }, 'DPI_INVALIDO'],
    ['DPI con letras', { dpi: '1234 56789 01ab' }, 'DPI_INVALIDO'],
    ['sin dirección', { direccionResidencia: '' }, 'DATOS_DE_RESIDENCIA_REQUERIDOS'],
    ['sin historial', { historialEducativo: ' ' }, 'HISTORIAL_EDUCATIVO_REQUERIDO'],
    ['sin teléfono', { telefono: '' }, 'DATOS_DE_COMUNICACION_REQUERIDOS'],
    ['teléfono de 7 dígitos', { telefono: '5555123' }, 'TELEFONO_INVALIDO'],
    ['correo sin arroba', { correo: 'carlos.correo.com' }, 'CORREO_INVALIDO'],
  ])('rechaza %s y no escribe ni avisa', async (_caso, cambio, codigo) => {
    const { handler, pilotos, publicar } = preparar();

    await expect(
      codigoRechazado(handler, new RegistrarPiloto({ ...DATOS, ...cambio }, 5, 9)),
    ).resolves.toBe(codigo);
    expect(pilotos.save.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('rechaza un DPI ya registrado aunque venga con otros espacios', async () => {
    const { handler, pilotos, publicar } = preparar({ dpiExistente: true });

    await expect(
      codigoRechazado(handler, new RegistrarPiloto({ ...DATOS, dpi: '1234567890101' }, null, 9)),
    ).resolves.toBe('DPI_PILOTO_DUPLICADO');
    expect(pilotos.existsBy.mock.calls).toContainEqual([{ dpi: '1234 56789 0101' }]);
    expect(pilotos.save.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('traduce la violación de unicidad de la base a DPI_PILOTO_DUPLICADO', async () => {
    const { handler, pilotos, publicar } = preparar();
    pilotos.save.mockRejectedValue(
      new QueryFailedError('INSERT', [], Object.assign(new Error('duplicado'), { code: '23505' })),
    );

    await expect(codigoRechazado(handler, new RegistrarPiloto(DATOS, null, 9))).resolves.toBe(
      'DPI_PILOTO_DUPLICADO',
    );
    expect(publicar).not.toHaveBeenCalled();
  });

  it('no traduce otros errores de la base', async () => {
    const { handler, pilotos } = preparar();
    pilotos.save.mockRejectedValue(new Error('conexión perdida'));

    await expect(handler.execute(new RegistrarPiloto(DATOS, null, 9))).rejects.toThrow(
      'conexión perdida',
    );
  });

  it('rechaza un bus inexistente', async () => {
    const { handler, pilotos } = preparar({ bus: null });

    await expect(codigoRechazado(handler, new RegistrarPiloto(DATOS, 99, 9))).resolves.toBe(
      'BUS_NO_EXISTE',
    );
    expect(pilotos.save.mock.calls).toHaveLength(0);
  });

  it('rechaza un bus de baja', async () => {
    const { handler, pilotos, publicar } = preparar({ bus: bus('BAJA') });

    await expect(codigoRechazado(handler, new RegistrarPiloto(DATOS, 5, 9))).resolves.toBe(
      'BUS_DE_BAJA',
    );
    expect(pilotos.save.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('admite un bus en mantenimiento', async () => {
    const { handler } = preparar({ bus: bus('MANTENIMIENTO') });

    await expect(handler.execute(new RegistrarPiloto(DATOS, 5, 9))).resolves.toBe(42);
  });

  it('el DPI duplicado se lanza antes que el bus inexistente', async () => {
    const { handler } = preparar({ dpiExistente: true, bus: null });

    await expect(codigoRechazado(handler, new RegistrarPiloto(DATOS, 99, 9))).resolves.toBe(
      'DPI_PILOTO_DUPLICADO',
    );
  });

  it('el evento de auditoría no lleva datos personales', async () => {
    const { handler, publicar } = preparar();

    await handler.execute(new RegistrarPiloto(DATOS, 5, 9));

    const evento = (publicar.mock.calls[0] as [PilotoRegistrado])[0];
    expect(evento).toMatchObject({
      usuarioId: 9,
      accion: 'PILOTO_REGISTRADO',
      entidad: 'piloto',
      entidadId: '42',
      resumen: { busId: 5 },
    });
    const texto = JSON.stringify(evento);
    for (const dato of ['1234', '5555', 'Zona 1', 'correo.com', 'Perito', 'Carlos']) {
      expect(texto).not.toContain(dato);
    }
  });
});
