import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import { AlertaCapacidad } from '../../entities/alerta-capacidad.entity';
import { AlertaNoExiste, AlertaYaAtendida, EstacionAjena } from '../../errors/errores-de-alertas';
import { AlertaAtendida } from '../../events/eventos-de-alertas';
import { AtenderAlerta } from '../impl/atender-alerta.command';

@CommandHandler(AtenderAlerta)
export class AtenderAlertaHandler implements ICommandHandler<AtenderAlerta> {
  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly eventos: EventBus,
  ) {}

  async execute({ id, estacionDelActor, actorId }: AtenderAlerta): Promise<void> {
    const alerta = await this.unidadDeTrabajo.ejecutar(async (contexto) => {
      const alertas = contexto.repositorio(AlertaCapacidad);
      const actual = await alertas.findOne({ where: { id }, lock: { mode: 'pessimistic_write' } });
      if (!actual) {
        throw new AlertaNoExiste();
      }
      if (estacionDelActor === null || estacionDelActor !== actual.estacionId) {
        throw new EstacionAjena();
      }
      if (actual.atendida) {
        throw new AlertaYaAtendida();
      }
      await alertas.update({ id }, { atendida: true, atendidaPor: actorId });
      return actual;
    });
    this.eventos.publish(new AlertaAtendida(actorId, id, alerta.estacionId, alerta.busId));
  }
}
