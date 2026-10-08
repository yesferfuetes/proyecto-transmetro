import type { EventBus } from '@nestjs/cqrs';
import type { FindManyOptions, FindOperator } from 'typeorm';
import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import { NumeroDeEstacionesDeLineaCambiado } from '../../../shared/contratos/red';
import { Estacion } from '../../entities/estacion.entity';
import { LineaEstacion } from '../../entities/linea-estacion.entity';
import { Linea } from '../../entities/linea.entity';
import { RecorridoDeLineaDefinido } from '../../events/eventos-de-red';
import { DefinirRecorridoDeLinea, Parada } from '../impl/definir-recorrido-de-linea.command';
import { DefinirRecorridoDeLineaHandler } from './definir-recorrido-de-linea.handler';

const L1 = 1;
const [E1, E2, E3, E4, E5] = [11, 12, 13, 14, 15];
const CODIGOS: Record<number, string> = {
  [E1]: 'E1',
  [E2]: 'E2',
  [E3]: 'E3',
  [E4]: 'E4',
  [E5]: 'E5',
};
const ACTOR = 7;

interface Escenario {
  estado?: string;
  /** Estaciones del recorrido vigente de L1, en orden. */
  vigente?: number[];
  /** Estaciones que también están en alguna otra línea. */
  enOtrasLineas?: number[];
  existentes?: number[];
}

interface Preparado {
  handler: DefinirRecorridoDeLineaHandler;
  lineas: RepositorioSimulado<Linea>;
  estaciones: RepositorioSimulado<Estacion>;
  recorridos: RepositorioSimulado<LineaEstacion>;
  publicar: jest.Mock;
}

function idsDelFiltro(valor: unknown): number[] {
  return (valor as FindOperator<number[]>).value;
}

function preparar({
  estado = 'EN_CONSTRUCCION',
  vigente = [],
  enOtrasLineas = [],
  existentes = [E1, E2, E3, E4, E5],
}: Escenario = {}): Preparado {
  const unidad = new UnidadDeTrabajoSimulada();
  const lineas = unidad.registrar(Linea);
  const estaciones = unidad.registrar(Estacion);
  const recorridos = unidad.registrar(LineaEstacion);
  lineas.findOne.mockResolvedValue({ id: L1, estado } as Linea);
  estaciones.find.mockImplementation((opciones?: FindManyOptions<Estacion>) => {
    const pedidas = idsDelFiltro((opciones?.where as { id: unknown }).id);
    return Promise.resolve(
      pedidas.filter((id) => existentes.includes(id)).map((id) => ({ id }) as Estacion),
    );
  });
  recorridos.find.mockImplementation((opciones?: FindManyOptions<LineaEstacion>) => {
    if (opciones?.relations) {
      return Promise.resolve(
        vigente.map(
          (estacionId, indice) =>
            ({
              lineaId: L1,
              estacionId,
              ordenSecuencia: indice + 1,
              estacion: { id: estacionId, codigo: CODIGOS[estacionId] },
            }) as LineaEstacion,
        ),
      );
    }
    const pedidas = idsDelFiltro((opciones?.where as { estacionId: unknown }).estacionId);
    return Promise.resolve(
      pedidas
        .filter((id) => enOtrasLineas.includes(id))
        .map((estacionId) => ({ estacionId, lineaId: 2 }) as LineaEstacion),
    );
  });
  const publicar = jest.fn();
  const handler = new DefinirRecorridoDeLineaHandler(unidad, {
    publish: publicar,
  } as unknown as EventBus);
  return { handler, lineas, estaciones, recorridos, publicar };
}

function definir(paradas: Parada[]): DefinirRecorridoDeLinea {
  return new DefinirRecorridoDeLinea(L1, paradas, ACTOR);
}

function parada(estacionId: number, distanciaSiguienteKm: number | null): Parada {
  return { estacionId, distanciaSiguienteKm };
}

function sinEscrituras({ recorridos, lineas, publicar }: Preparado): void {
  expect(recorridos.delete.mock.calls).toHaveLength(0);
  expect(recorridos.insert.mock.calls).toHaveLength(0);
  expect(lineas.update.mock.calls).toHaveLength(0);
  expect(publicar).not.toHaveBeenCalled();
}

describe('DefinirRecorridoDeLineaHandler', () => {
  it('numera las posiciones, deja sin distancia la última y calcula la longitud', async () => {
    const preparado = preparar();
    await preparado.handler.execute(definir([parada(E1, 1.2), parada(E2, 0.8), parada(E3, null)]));

    expect(preparado.recorridos.delete.mock.calls).toContainEqual([{ lineaId: L1 }]);
    expect(preparado.recorridos.insert.mock.calls).toContainEqual([
      [
        { lineaId: L1, estacionId: E1, ordenSecuencia: 1, distanciaSiguienteKm: 1.2 },
        { lineaId: L1, estacionId: E2, ordenSecuencia: 2, distanciaSiguienteKm: 0.8 },
        { lineaId: L1, estacionId: E3, ordenSecuencia: 3, distanciaSiguienteKm: null },
      ],
    ]);
    expect(preparado.lineas.update.mock.calls).toContainEqual([{ id: L1 }, { longitudKm: 2 }]);
  });

  it('reordena el recorrido y recalcula la longitud', async () => {
    const preparado = preparar({ vigente: [E1, E2, E3] });
    await preparado.handler.execute(definir([parada(E1, 0.5), parada(E3, 0.9), parada(E2, null)]));

    expect(preparado.recorridos.insert.mock.calls).toContainEqual([
      [
        { lineaId: L1, estacionId: E1, ordenSecuencia: 1, distanciaSiguienteKm: 0.5 },
        { lineaId: L1, estacionId: E3, ordenSecuencia: 2, distanciaSiguienteKm: 0.9 },
        { lineaId: L1, estacionId: E2, ordenSecuencia: 3, distanciaSiguienteKm: null },
      ],
    ]);
    expect(preparado.lineas.update.mock.calls).toContainEqual([{ id: L1 }, { longitudKm: 1.4 }]);
  });

  it('bloquea la línea antes de validar', async () => {
    const preparado = preparar();
    await preparado.handler.execute(definir([parada(E1, 1), parada(E2, null)]));

    expect(preparado.lineas.findOne.mock.calls).toContainEqual([
      {
        where: { id: L1 },
        lock: { mode: 'pessimistic_write' },
      },
    ]);
  });

  it('rechaza una línea inexistente', async () => {
    const preparado = preparar();
    preparado.lineas.findOne.mockResolvedValue(null);

    await expect(preparado.handler.execute(definir([parada(E1, null)]))).rejects.toMatchObject({
      codigo: 'LINEA_NO_EXISTE',
      tipo: 'NO_ENCONTRADO',
    });
  });

  it('rechaza una estación repetida y no cambia el recorrido vigente', async () => {
    const preparado = preparar({ vigente: [E1, E2, E3] });

    await expect(
      preparado.handler.execute(definir([parada(E1, 1), parada(E2, 1), parada(E2, null)])),
    ).rejects.toMatchObject({ codigo: 'ESTACION_REPETIDA_EN_RECORRIDO' });
    sinEscrituras(preparado);
  });

  it('rechaza una estación inexistente e indica cuál', async () => {
    const preparado = preparar({ existentes: [E1] });

    const error: unknown = await preparado.handler
      .execute(definir([parada(E1, 1), parada(99, null)]))
      .catch((e: unknown) => e);
    expect(error).toMatchObject({
      codigo: 'ESTACION_NO_EXISTE',
      tipo: 'REGLA_NEGOCIO',
      detalles: [{ campo: 'paradas', mensajes: ['La estación 99 no existe.'] }],
    });
    sinEscrituras(preparado);
  });

  it('exige la distancia de toda estación que no es la última', async () => {
    const preparado = preparar();

    await expect(
      preparado.handler.execute(definir([parada(E1, 1), parada(E2, null), parada(E3, null)])),
    ).rejects.toMatchObject({
      codigo: 'DISTANCIA_REQUERIDA',
      detalles: [{ campo: 'paradas.1.distanciaSiguienteKm' }],
    });
    sinEscrituras(preparado);
  });

  it.each([0, -1, 1000, 0.0004, 1.2345])('rechaza la distancia %p', async (distancia) => {
    const preparado = preparar();

    await expect(
      preparado.handler.execute(definir([parada(E1, distancia), parada(E2, null)])),
    ).rejects.toMatchObject({ codigo: 'DISTANCIA_INVALIDA' });
    sinEscrituras(preparado);
  });

  it('acepta la distancia máxima de 999.999 km', async () => {
    const preparado = preparar();
    await preparado.handler.execute(definir([parada(E1, 999.999), parada(E2, null)]));

    expect(preparado.lineas.update.mock.calls).toContainEqual([
      { id: L1 },
      { longitudKm: 999.999 },
    ]);
  });

  it('descarta la distancia escrita en la última estación', async () => {
    const preparado = preparar();
    await preparado.handler.execute(definir([parada(E1, 1.2), parada(E2, 7)]));

    expect(preparado.recorridos.insert.mock.calls).toContainEqual([
      [
        expect.objectContaining({ estacionId: E1, distanciaSiguienteKm: 1.2 }),
        expect.objectContaining({ estacionId: E2, distanciaSiguienteKm: null }),
      ],
    ]);
    expect(preparado.lineas.update.mock.calls).toContainEqual([{ id: L1 }, { longitudKm: 1.2 }]);
  });

  it('rechaza dejar una línea activa con una sola estación', async () => {
    const preparado = preparar({
      estado: 'ACTIVA',
      vigente: [E1, E2, E3],
      enOtrasLineas: [E2, E3],
    });

    await expect(preparado.handler.execute(definir([parada(E1, null)]))).rejects.toMatchObject({
      codigo: 'RECORRIDO_INSUFICIENTE',
    });
    sinEscrituras(preparado);
  });

  it('permite una línea en construcción sin estaciones y deja su longitud vacía', async () => {
    const preparado = preparar();
    await preparado.handler.execute(definir([]));

    expect(preparado.recorridos.insert.mock.calls).toHaveLength(0);
    expect(preparado.lineas.update.mock.calls).toContainEqual([{ id: L1 }, { longitudKm: null }]);
  });

  it('incluye una estación que ya está en otra línea', async () => {
    const preparado = preparar({ enOtrasLineas: [E2] });
    await preparado.handler.execute(definir([parada(E2, 1), parada(E3, null)]));

    expect(preparado.recorridos.insert.mock.calls).toContainEqual([
      [
        expect.objectContaining({ estacionId: E2, ordenSecuencia: 1 }),
        expect.objectContaining({ estacionId: E3, ordenSecuencia: 2 }),
      ],
    ]);
    expect(preparado.recorridos.delete.mock.calls).toContainEqual([{ lineaId: L1 }]);
  });

  it('rechaza quitar una estación que quedaría sin ninguna línea', async () => {
    const preparado = preparar({ vigente: [E1, E2, E3] });

    await expect(
      preparado.handler.execute(definir([parada(E1, 1), parada(E3, null)])),
    ).rejects.toMatchObject({
      codigo: 'ESTACION_SIN_LINEA',
      message: expect.stringContaining('E2') as unknown,
    });
    sinEscrituras(preparado);
  });

  it('quita una estación que sigue en otra línea', async () => {
    const preparado = preparar({ vigente: [E1, E2, E3], enOtrasLineas: [E2] });
    await preparado.handler.execute(definir([parada(E1, 1), parada(E3, null)]));

    expect(preparado.recorridos.find.mock.calls).toContainEqual([
      expect.objectContaining({ select: { estacionId: true } }),
    ]);
    expect(preparado.recorridos.insert.mock.calls).toContainEqual([
      [expect.objectContaining({ estacionId: E1 }), expect.objectContaining({ estacionId: E3 })],
    ]);
  });

  it('acepta estaciones de otra municipalidad: no la compara con la de la línea', async () => {
    const preparado = preparar();
    preparado.estaciones.find.mockResolvedValue([
      { id: E1, municipalidadId: 1 } as Estacion,
      { id: E2, municipalidadId: 2 } as Estacion,
    ]);
    await preparado.handler.execute(definir([parada(E1, 1), parada(E2, null)]));

    expect(preparado.recorridos.insert.mock.calls.length).toBeGreaterThan(0);
  });

  it('avisa el cambio en el número de estaciones con el valor nuevo', async () => {
    const preparado = preparar({ estado: 'ACTIVA', vigente: [E1, E2, E3, E4] });
    await preparado.handler.execute(
      definir([parada(E1, 1), parada(E2, 1), parada(E3, 1), parada(E4, 1), parada(E5, null)]),
    );

    expect(preparado.publicar.mock.calls).toContainEqual([
      new NumeroDeEstacionesDeLineaCambiado(L1, 4, 5),
    ]);
    expect(preparado.publicar.mock.calls).toContainEqual([
      new RecorridoDeLineaDefinido(ACTOR, L1, 5, 4),
    ]);
  });

  it('no avisa cambio de número de estaciones si la cantidad es la misma', async () => {
    const preparado = preparar({ vigente: [E1, E2, E3] });
    await preparado.handler.execute(definir([parada(E3, 1), parada(E2, 1), parada(E1, null)]));

    expect(preparado.publicar.mock.calls).toHaveLength(1);
    expect(preparado.publicar.mock.calls).toContainEqual([expect.any(RecorridoDeLineaDefinido)]);
  });

  it('acepta un recorrido más corto aunque la flota quede fuera de rango: no consulta la flota', async () => {
    const unidad = new UnidadDeTrabajoSimulada();
    const lineas = unidad.registrar(Linea);
    const estaciones = unidad.registrar(Estacion);
    const recorridos = unidad.registrar(LineaEstacion);
    lineas.findOne.mockResolvedValue({ id: L1, estado: 'ACTIVA' } as Linea);
    estaciones.find.mockResolvedValue([E1, E2, E3].map((id) => ({ id }) as Estacion));
    recorridos.find
      .mockResolvedValueOnce(
        [E1, E2, E3, E4].map(
          (estacionId) =>
            ({ estacionId, estacion: { codigo: CODIGOS[estacionId] } }) as LineaEstacion,
        ),
      )
      .mockResolvedValueOnce([{ estacionId: E4 } as LineaEstacion]);
    const publicar = jest.fn();
    const handler = new DefinirRecorridoDeLineaHandler(unidad, {
      publish: publicar,
    } as unknown as EventBus);

    await handler.execute(definir([parada(E1, 1), parada(E2, 1), parada(E3, null)]));

    expect(recorridos.insert.mock.calls.length).toBeGreaterThan(0);
    expect(publicar).toHaveBeenCalledWith(new NumeroDeEstacionesDeLineaCambiado(L1, 4, 3));
  });
});
