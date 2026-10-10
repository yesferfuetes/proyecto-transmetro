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
import { RegistrarOcupacionDeBus } from '../impl/registrar-ocupacion-de-bus.command';
import { RegistrarOcupacionDeBusHandler } from './registrar-ocupacion-de-bus.handler';

interface Preparado {
  handler: RegistrarOcupacionDeBusHandler;
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
  alertas.save.mockImplementation((alerta) => Promise.resolve({ id: 56, ...alerta }) as never);
  const flota = { obtenerBus: jest.fn().mockResolvedValue(bus) } as unknown as FlotaAdapter;
  const red = {
    estacionesDeLinea: jest.fn().mockResolvedValue(estacionesDeLaLinea.map((id) => ({ id }))),
  } as unknown as RedAdapter;
  const publicar = jest.fn();
  const handler = new RegistrarOcupacionDeBusHandler(unidad, red, flota, {
    publish: publicar,
  } as unknown as EventBus);
  return { handler, unidad, alertas, publicar };
}

function ocupacion(
  pasajeros: number | null,
  extra: { estacionDelActor?: number | null; busId?: number; estacionId?: number } = {},
): RegistrarOcupacionDeBus {
  return new RegistrarOcupacionDeBus(
    extra.estacionId ?? ESTACION,
    extra.busId ?? 7,
    pasajeros,
    extra.estacionDelActor === undefined ? ESTACION : extra.estacionDelActor,
    9,
  );
}

describe('RegistrarOcupacionDeBusHandler', () => {
  it('crea la alerta de baja ocupación con 24 % y devuelve su id', async () => {
    const { handler, alertas } = preparar();

    await expect(handler.execute(ocupacion(24))).resolves.toBe(56);

    expect(alertas.save.mock.calls).toContainEqual([
      {
        estacionId: ESTACION,
        busId: 7,
        tipo: 'BAJA_OCUPACION',
        porcentajeOcupacion: 24,
        atendida: false,
        atendidaPor: null,
      },
    ]);
  });

  it('con 0 pasajeros crea la alerta con 0 %', async () => {
    const { handler, alertas } = preparar();

    await expect(handler.execute(ocupacion(0))).resolves.toBe(56);

    expect(alertas.save.mock.calls).toContainEqual([
      expect.objectContaining({ porcentajeOcupacion: 0 }),
    ]);
  });

  it('con 25 % exactos no crea nada y devuelve null', async () => {
    const { handler, alertas, unidad, publicar } = preparar();

    await expect(handler.execute(ocupacion(25))).resolves.toBeNull();

    expect(alertas.save.mock.calls).toHaveLength(0);
    expect(unidad.ejecuciones).toBe(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('con un bus de capacidad 3, 0 a bordo es baja ocupación y 1 (33.33 %) no', async () => {
    const { handler, alertas } = preparar({ ...BUS_ACTIVO, capacidadMax: 3 });

    await expect(handler.execute(ocupacion(1))).resolves.toBeNull();
    await expect(handler.execute(ocupacion(0))).resolves.toBe(56);

    expect(alertas.save.mock.calls).toHaveLength(1);
  });

  it('con un bus de capacidad 7, 1 a bordo se guarda como 14.29 %', async () => {
    const { handler, alertas } = preparar({ ...BUS_ACTIVO, capacidadMax: 7 });

    await handler.execute(ocupacion(1));

    expect(alertas.save.mock.calls).toContainEqual([
      expect.objectContaining({ porcentajeOcupacion: 14.29 }),
    ]);
  });

  it('acepta tantos pasajeros como la capacidad y rechaza uno más', async () => {
    const { handler } = preparar();

    await expect(handler.execute(ocupacion(100))).resolves.toBeNull();
    await expect(handler.execute(ocupacion(101))).rejects.toMatchObject({
      codigo: 'PASAJEROS_EXCEDEN_CAPACIDAD',
    });
  });

  it('avisa con el actor y la alerta de baja ocupación', async () => {
    const { handler, publicar } = preparar();

    await handler.execute(ocupacion(24));

    const [[evento]] = publicar.mock.calls as [[AlertaGenerada]];
    expect(evento).toEqual(new AlertaGenerada(9, 56, 'BAJA_OCUPACION', ESTACION, 7, 24));
    expect(evento.usuarioId).toBe(9);
  });

  it('bloquea por tipo, estación y bus', async () => {
    const { handler, unidad } = preparar();

    await handler.execute(ocupacion(10));

    expect(unidad.candados).toEqual([{ espacio: `alerta-BAJA_OCUPACION-${ESTACION}`, id: 7 }]);
  });

  it('rechaza la estación de otro operador y al operador sin estación', async () => {
    const { handler, alertas } = preparar();

    await expect(handler.execute(ocupacion(10, { estacionId: 4 }))).rejects.toMatchObject({
      codigo: 'ESTACION_AJENA',
    });
    await expect(handler.execute(ocupacion(10, { estacionDelActor: null }))).rejects.toMatchObject({
      codigo: 'ESTACION_AJENA',
    });
    expect(alertas.save.mock.calls).toHaveLength(0);
  });

  it('rechaza un bus inexistente', async () => {
    const { handler } = preparar(null);

    await expect(handler.execute(ocupacion(10))).rejects.toMatchObject({
      codigo: 'BUS_NO_EXISTE',
    });
  });

  it.each(['MANTENIMIENTO', 'BAJA'] as const)('rechaza un bus en %s', async (estado) => {
    const { handler } = preparar({ ...BUS_ACTIVO, estado });

    await expect(handler.execute(ocupacion(10))).rejects.toMatchObject({
      codigo: 'BUS_NO_OPERATIVO',
    });
  });

  it('rechaza un bus de otra línea y un bus sin línea', async () => {
    await expect(preparar(BUS_ACTIVO, [1, 5]).handler.execute(ocupacion(10))).rejects.toMatchObject(
      { codigo: 'BUS_NO_SIRVE_A_LA_ESTACION' },
    );
    await expect(
      preparar({ ...BUS_ACTIVO, lineaId: null }).handler.execute(ocupacion(10)),
    ).rejects.toMatchObject({ codigo: 'BUS_NO_SIRVE_A_LA_ESTACION' });
  });

  it.each([
    ['negativa', -1],
    ['decimal', 0.5],
    ['vacía', null],
  ])('rechaza una cifra %s', async (_nombre, cifra) => {
    const { handler, alertas } = preparar();

    await expect(handler.execute(ocupacion(cifra))).rejects.toMatchObject({
      codigo: 'PASAJEROS_INVALIDOS',
    });
    expect(alertas.save.mock.calls).toHaveLength(0);
  });

  it('no crea una segunda alerta pendiente del mismo bus y tipo', async () => {
    const { handler, alertas, publicar } = preparar(BUS_ACTIVO, [ESTACION], true);

    await expect(handler.execute(ocupacion(10))).rejects.toMatchObject({
      codigo: 'ALERTA_PENDIENTE_EXISTENTE',
    });

    expect(alertas.existsBy.mock.calls).toContainEqual([
      expect.objectContaining({ tipo: 'BAJA_OCUPACION', atendida: false }),
    ]);
    expect(alertas.save.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });
});
