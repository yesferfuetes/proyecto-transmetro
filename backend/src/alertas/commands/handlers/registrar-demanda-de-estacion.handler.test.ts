import type { EventBus } from '@nestjs/cqrs';
import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import type { BusResumen } from '../../../shared/contratos/flota';
import { AlertaCapacidad } from '../../entities/alerta-capacidad.entity';
import { AlertaGenerada } from '../../events/eventos-de-alertas';
import type { FlotaAdapter } from '../../infrastructure/adapters/flota.adapter';
import type { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { RegistrarDemandaDeEstacion } from '../impl/registrar-demanda-de-estacion.command';
import { RegistrarDemandaDeEstacionHandler } from './registrar-demanda-de-estacion.handler';

interface Preparado {
  handler: RegistrarDemandaDeEstacionHandler;
  unidad: UnidadDeTrabajoSimulada;
  alertas: RepositorioSimulado<AlertaCapacidad>;
  publicar: jest.Mock;
}

const ESTACION = 3;
const BUS_ACTIVO: BusResumen = {
  id: 7,
  placa: 'TM-0007',
  capacidadMax: 100,
  lineaId: 2,
  estado: 'ACTIVO',
};

function preparar(
  bus: BusResumen | null = BUS_ACTIVO,
  estacionesDeLaLinea: number[] = [1, ESTACION, 5],
  hayPendiente = false,
): Preparado {
  const unidad = new UnidadDeTrabajoSimulada();
  const alertas = unidad.registrar(AlertaCapacidad);
  alertas.existsBy.mockResolvedValue(hayPendiente);
  alertas.save.mockImplementation((alerta) => Promise.resolve({ id: 55, ...alerta }) as never);
  const flota = { obtenerBus: jest.fn().mockResolvedValue(bus) } as unknown as FlotaAdapter;
  const red = {
    estacionesDeLinea: jest.fn().mockResolvedValue(estacionesDeLaLinea.map((id) => ({ id }))),
  } as unknown as RedAdapter;
  const publicar = jest.fn();
  const handler = new RegistrarDemandaDeEstacionHandler(unidad, red, flota, {
    publish: publicar,
  } as unknown as EventBus);
  return { handler, unidad, alertas, publicar };
}

function demanda(
  pasajeros: number | null,
  extra: Partial<{ estacionDelActor: number | null; busId: number; estacionId: number }> = {},
): RegistrarDemandaDeEstacion {
  return new RegistrarDemandaDeEstacion(
    extra.estacionId ?? ESTACION,
    extra.busId ?? 7,
    pasajeros,
    'estacionDelActor' in extra ? (extra.estacionDelActor ?? null) : ESTACION,
    9,
  );
}

describe('RegistrarDemandaDeEstacionHandler', () => {
  it('crea la alerta de sobrecupo con 150 % y devuelve su id', async () => {
    const { handler, alertas } = preparar();

    await expect(handler.execute(demanda(150))).resolves.toBe(55);

    expect(alertas.save.mock.calls).toContainEqual([
      {
        estacionId: ESTACION,
        busId: 7,
        tipo: 'SOBRECUPO',
        porcentajeOcupacion: 150,
        atendida: false,
        atendidaPor: null,
      },
    ]);
  });

  it('con 149 % no crea nada y devuelve null', async () => {
    const { handler, alertas, unidad, publicar } = preparar();

    await expect(handler.execute(demanda(149))).resolves.toBeNull();

    expect(alertas.save.mock.calls).toHaveLength(0);
    expect(unidad.ejecuciones).toBe(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('con 400 % crea la alerta con 400', async () => {
    const { handler, alertas } = preparar();

    await handler.execute(demanda(400));

    expect(alertas.save.mock.calls).toContainEqual([
      expect.objectContaining({ porcentajeOcupacion: 400 }),
    ]);
  });

  it('con 999 % exactos crea la alerta y con más rechaza', async () => {
    const { handler, alertas } = preparar();

    await handler.execute(demanda(999));
    await expect(handler.execute(demanda(1000))).rejects.toMatchObject({
      codigo: 'PASAJEROS_INVALIDOS',
    });

    expect(alertas.save.mock.calls).toHaveLength(1);
    expect(alertas.save.mock.calls).toContainEqual([
      expect.objectContaining({ porcentajeOcupacion: 999 }),
    ]);
  });

  it('con un bus de capacidad 3, 5 esperando (166.67 %) crea alerta y 4 (133.33 %) no', async () => {
    const { handler, alertas } = preparar({ ...BUS_ACTIVO, capacidadMax: 3 });

    await expect(handler.execute(demanda(4))).resolves.toBeNull();
    await expect(handler.execute(demanda(5))).resolves.toBe(55);

    expect(alertas.save.mock.calls).toContainEqual([
      expect.objectContaining({ porcentajeOcupacion: 166.67 }),
    ]);
  });

  it('bloquea por tipo, estación y bus antes de buscar la pendiente', async () => {
    const { handler, unidad } = preparar();

    await handler.execute(demanda(150));

    expect(unidad.candados).toEqual([{ espacio: `alerta-SOBRECUPO-${ESTACION}`, id: 7 }]);
  });

  it('avisa con el actor, la alerta, el tipo y el porcentaje, una vez creada', async () => {
    const { handler, publicar } = preparar();

    await handler.execute(demanda(150));

    const [[evento]] = publicar.mock.calls as [[AlertaGenerada]];
    expect(evento).toEqual(new AlertaGenerada(9, 55, 'SOBRECUPO', ESTACION, 7, 150));
    expect(evento).toMatchObject({
      usuarioId: 9,
      accion: 'ALERTA_GENERADA',
      entidad: 'alerta',
      entidadId: '55',
      resumen: { tipo: 'SOBRECUPO', estacionId: ESTACION, busId: 7, porcentaje: 150 },
    });
  });

  it('rechaza la estación de otro operador', async () => {
    const { handler, alertas } = preparar();

    await expect(handler.execute(demanda(150, { estacionId: 4 }))).rejects.toMatchObject({
      codigo: 'ESTACION_AJENA',
    });
    expect(alertas.save.mock.calls).toHaveLength(0);
  });

  it('rechaza al operador sin estación', async () => {
    const { handler } = preparar();

    await expect(handler.execute(demanda(150, { estacionDelActor: null }))).rejects.toMatchObject({
      codigo: 'ESTACION_AJENA',
    });
  });

  it('rechaza un bus inexistente', async () => {
    const { handler } = preparar(null);

    await expect(handler.execute(demanda(150, { busId: 99 }))).rejects.toMatchObject({
      codigo: 'BUS_NO_EXISTE',
    });
  });

  it.each(['MANTENIMIENTO', 'BAJA'] as const)('rechaza un bus en %s', async (estado) => {
    const { handler } = preparar({ ...BUS_ACTIVO, estado });

    await expect(handler.execute(demanda(150))).rejects.toMatchObject({
      codigo: 'BUS_NO_OPERATIVO',
    });
  });

  it('rechaza un bus de una línea que no pasa por la estación', async () => {
    const { handler, alertas } = preparar(BUS_ACTIVO, [1, 5]);

    await expect(handler.execute(demanda(150))).rejects.toMatchObject({
      codigo: 'BUS_NO_SIRVE_A_LA_ESTACION',
    });
    expect(alertas.save.mock.calls).toHaveLength(0);
  });

  it('rechaza un bus sin línea', async () => {
    const { handler } = preparar({ ...BUS_ACTIVO, lineaId: null });

    await expect(handler.execute(demanda(150))).rejects.toMatchObject({
      codigo: 'BUS_NO_SIRVE_A_LA_ESTACION',
    });
  });

  it.each([
    ['negativa', -1],
    ['decimal', 1.5],
    ['vacía', null],
    ['no numérica', Number.NaN],
  ])('rechaza una cifra %s y no crea nada', async (_nombre, cifra) => {
    const { handler, alertas } = preparar();

    await expect(handler.execute(demanda(cifra))).rejects.toMatchObject({
      codigo: 'PASAJEROS_INVALIDOS',
    });
    expect(alertas.save.mock.calls).toHaveLength(0);
  });

  it('no crea una segunda alerta si ya hay una pendiente igual', async () => {
    const { handler, alertas, publicar } = preparar(BUS_ACTIVO, [ESTACION], true);

    await expect(handler.execute(demanda(200))).rejects.toMatchObject({
      codigo: 'ALERTA_PENDIENTE_EXISTENTE',
    });

    expect(alertas.existsBy.mock.calls).toContainEqual([
      {
        estacionId: ESTACION,
        busId: 7,
        tipo: 'SOBRECUPO',
        atendida: false,
      },
    ]);
    expect(alertas.save.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('si la anterior ya fue atendida, crea una nueva', async () => {
    const { handler, alertas } = preparar(BUS_ACTIVO, [ESTACION], false);

    await expect(handler.execute(demanda(200))).resolves.toBe(55);

    expect(alertas.save.mock.calls).toHaveLength(1);
  });
});
