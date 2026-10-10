import type { EventBus } from '@nestjs/cqrs';
import {
  RepositorioSimulado,
  UnidadDeTrabajoSimulada,
} from '../../../../test/utilidades/unidad-de-trabajo-simulada';
import { AlertaCapacidad } from '../../entities/alerta-capacidad.entity';
import { AlertaAtendida } from '../../events/eventos-de-alertas';
import { AtenderAlerta } from '../impl/atender-alerta.command';
import { AtenderAlertaHandler } from './atender-alerta.handler';

interface Preparado {
  handler: AtenderAlertaHandler;
  alertas: RepositorioSimulado<AlertaCapacidad>;
  publicar: jest.Mock;
}

function alerta(extra: Partial<AlertaCapacidad> = {}): AlertaCapacidad {
  return {
    id: 5,
    estacionId: 3,
    busId: 7,
    tipo: 'SOBRECUPO',
    porcentajeOcupacion: 150,
    fechaHora: new Date('2026-10-09T10:00:00Z'),
    atendida: false,
    atendidaPor: null,
    ...extra,
  };
}

function preparar(existente: AlertaCapacidad | null): Preparado {
  const unidad = new UnidadDeTrabajoSimulada();
  const alertas = unidad.registrar(AlertaCapacidad);
  alertas.findOne.mockResolvedValue(existente);
  const publicar = jest.fn();
  const handler = new AtenderAlertaHandler(unidad, { publish: publicar } as unknown as EventBus);
  return { handler, alertas, publicar };
}

describe('AtenderAlertaHandler', () => {
  it('atiende la alerta de su estación y guarda quién', async () => {
    const { handler, alertas } = preparar(alerta());

    await handler.execute(new AtenderAlerta(5, 3, 9));

    expect(alertas.update.mock.calls).toContainEqual([
      { id: 5 },
      { atendida: true, atendidaPor: 9 },
    ]);
  });

  it('bloquea la fila antes de marcarla', async () => {
    const { handler, alertas } = preparar(alerta());

    await handler.execute(new AtenderAlerta(5, 3, 9));

    expect(alertas.findOne.mock.calls).toContainEqual([
      {
        where: { id: 5 },
        lock: { mode: 'pessimistic_write' },
      },
    ]);
  });

  it('avisa con quién atendió, la estación y el bus', async () => {
    const { handler, publicar } = preparar(alerta());

    await handler.execute(new AtenderAlerta(5, 3, 9));

    const [[evento]] = publicar.mock.calls as [[AlertaAtendida]];
    expect(evento).toEqual(new AlertaAtendida(9, 5, 3, 7));
    expect(evento).toMatchObject({
      usuarioId: 9,
      accion: 'ALERTA_ATENDIDA',
      entidad: 'alerta',
      entidadId: '5',
      resumen: { estacionId: 3, busId: 7 },
    });
  });

  it('rechaza una alerta ya atendida y no cambia nada', async () => {
    const { handler, alertas, publicar } = preparar(alerta({ atendida: true, atendidaPor: 8 }));

    await expect(handler.execute(new AtenderAlerta(5, 3, 9))).rejects.toMatchObject({
      codigo: 'ALERTA_YA_ATENDIDA',
    });
    expect(alertas.update.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('rechaza una alerta de otra estación', async () => {
    const { handler, alertas, publicar } = preparar(alerta({ estacionId: 4 }));

    await expect(handler.execute(new AtenderAlerta(5, 3, 9))).rejects.toMatchObject({
      codigo: 'ESTACION_AJENA',
    });
    expect(alertas.update.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });

  it('rechaza al operador sin estación', async () => {
    const { handler } = preparar(alerta());

    await expect(handler.execute(new AtenderAlerta(5, null, 9))).rejects.toMatchObject({
      codigo: 'ESTACION_AJENA',
    });
  });

  it('rechaza una alerta que no existe', async () => {
    const { handler, alertas, publicar } = preparar(null);

    await expect(handler.execute(new AtenderAlerta(99, 3, 9))).rejects.toMatchObject({
      codigo: 'ALERTA_NO_EXISTE',
    });
    expect(alertas.update.mock.calls).toHaveLength(0);
    expect(publicar).not.toHaveBeenCalled();
  });
});
