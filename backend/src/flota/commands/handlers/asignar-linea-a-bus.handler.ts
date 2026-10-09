import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import { Bus } from '../../entities/bus.entity';
import { BusDeBaja, BusNoExiste } from '../../errors/errores-de-flota';
import { LineaDeBusCambiada } from '../../events/eventos-de-flota';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { AsignarLineaABus } from '../impl/asignar-linea-a-bus.command';
import { bloquearLineas, exigirLineaQueRecibe, exigirMinimoAlQuitar } from './validaciones';

@CommandHandler(AsignarLineaABus)
export class AsignarLineaABusHandler implements ICommandHandler<AsignarLineaABus> {
  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly red: RedAdapter,
    private readonly eventos: EventBus,
  ) {}

  async execute({ id, lineaId, actorId }: AsignarLineaABus): Promise<void> {
    const anterior = await this.unidadDeTrabajo.ejecutar(async (contexto) => {
      const buses = contexto.repositorio(Bus);
      const bus = await buses.findOne({ where: { id }, lock: { mode: 'pessimistic_write' } });
      if (!bus) {
        throw new BusNoExiste();
      }
      if (bus.estado === 'BAJA') {
        throw new BusDeBaja();
      }
      if (bus.lineaId === lineaId) {
        return lineaId;
      }
      await bloquearLineas(contexto, [bus.lineaId, lineaId]);
      if (lineaId !== null) {
        await exigirLineaQueRecibe(this.red, buses, lineaId);
      }
      if (bus.lineaId !== null) {
        await exigirMinimoAlQuitar(this.red, buses, bus.lineaId);
      }
      await buses.update({ id }, { lineaId });
      return bus.lineaId;
    });
    if (anterior !== lineaId) {
      this.eventos.publish(new LineaDeBusCambiada(actorId, id, anterior, lineaId));
    }
  }
}
