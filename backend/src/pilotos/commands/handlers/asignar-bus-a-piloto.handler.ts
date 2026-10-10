import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import { Piloto } from '../../entities/piloto.entity';
import { PilotoNoExiste } from '../../errors/errores-de-pilotos';
import { BusDePilotoCambiado } from '../../events/eventos-de-pilotos';
import { FlotaAdapter } from '../../infrastructure/adapters/flota.adapter';
import { exigirBusAsignable } from '../../services/bus-asignable';
import { AsignarBusAPiloto } from '../impl/asignar-bus-a-piloto.command';

@CommandHandler(AsignarBusAPiloto)
export class AsignarBusAPilotoHandler implements ICommandHandler<AsignarBusAPiloto> {
  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly flota: FlotaAdapter,
    private readonly eventos: EventBus,
  ) {}

  async execute({ id, busId, actorId }: AsignarBusAPiloto): Promise<void> {
    const anterior = await this.unidadDeTrabajo.ejecutar(async (contexto) => {
      const pilotos = contexto.repositorio(Piloto);
      const piloto = await pilotos.findOneBy({ id });
      if (!piloto) {
        throw new PilotoNoExiste();
      }
      if (piloto.busId === busId) {
        return undefined;
      }
      if (busId !== null) {
        await exigirBusAsignable(this.flota, busId);
      }
      await pilotos.update({ id }, { busId });
      return piloto.busId;
    });
    if (anterior !== undefined) {
      this.eventos.publish(new BusDePilotoCambiado(actorId, id, anterior, busId));
    }
  }
}
