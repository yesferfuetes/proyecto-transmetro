import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import { Bus } from '../../entities/bus.entity';
import { BusNoExiste } from '../../errors/errores-de-flota';
import { BusEditado } from '../../events/eventos-de-flota';
import { EditarBus } from '../impl/editar-bus.command';
import { validarCapacidadDeBus } from './validaciones';

@CommandHandler(EditarBus)
export class EditarBusHandler implements ICommandHandler<EditarBus> {
  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly eventos: EventBus,
  ) {}

  async execute({ id, capacidadMax, actorId }: EditarBus): Promise<void> {
    validarCapacidadDeBus(capacidadMax);
    const cambio = await this.unidadDeTrabajo.ejecutar(async (contexto) => {
      const buses = contexto.repositorio(Bus);
      const bus = await buses.findOne({ where: { id }, lock: { mode: 'pessimistic_write' } });
      if (!bus) {
        throw new BusNoExiste();
      }
      if (bus.capacidadMax === capacidadMax) {
        return false;
      }
      await buses.update({ id }, { capacidadMax });
      return true;
    });
    if (cambio) {
      this.eventos.publish(new BusEditado(actorId, id, capacidadMax));
    }
  }
}
