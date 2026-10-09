import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import { Bus } from '../../entities/bus.entity';
import { Parqueo } from '../../entities/parqueo.entity';
import { BusNoExiste, ParqueoIndicadoNoExiste } from '../../errors/errores-de-flota';
import { ParqueoDeBusCambiado } from '../../events/eventos-de-flota';
import { CambiarParqueoDeBus } from '../impl/cambiar-parqueo-de-bus.command';
import { exigirCupoEnParqueo } from './validaciones';

@CommandHandler(CambiarParqueoDeBus)
export class CambiarParqueoDeBusHandler implements ICommandHandler<CambiarParqueoDeBus> {
  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly eventos: EventBus,
  ) {}

  async execute({ id, parqueoId, actorId }: CambiarParqueoDeBus): Promise<void> {
    const anterior = await this.unidadDeTrabajo.ejecutar(async (contexto) => {
      const buses = contexto.repositorio(Bus);
      const bus = await buses.findOne({ where: { id }, lock: { mode: 'pessimistic_write' } });
      if (!bus) {
        throw new BusNoExiste();
      }
      if (bus.parqueoId === parqueoId) {
        return parqueoId;
      }
      const destino = await contexto
        .repositorio(Parqueo)
        .findOne({ where: { id: parqueoId }, lock: { mode: 'pessimistic_write' } });
      if (!destino) {
        throw new ParqueoIndicadoNoExiste();
      }
      await exigirCupoEnParqueo(buses, destino);
      await buses.update({ id }, { parqueoId });
      return bus.parqueoId;
    });
    if (anterior !== parqueoId) {
      this.eventos.publish(new ParqueoDeBusCambiado(actorId, id, anterior, parqueoId));
    }
  }
}
