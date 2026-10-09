import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import { Bus } from '../../entities/bus.entity';
import { Parqueo } from '../../entities/parqueo.entity';
import { ParqueoConBuses, ParqueoNoExiste } from '../../errors/errores-de-flota';
import { ParqueoEliminado } from '../../events/eventos-de-flota';
import { EliminarParqueo } from '../impl/eliminar-parqueo.command';

@CommandHandler(EliminarParqueo)
export class EliminarParqueoHandler implements ICommandHandler<EliminarParqueo> {
  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly eventos: EventBus,
  ) {}

  async execute({ id, actorId }: EliminarParqueo): Promise<void> {
    const codigo = await this.unidadDeTrabajo.ejecutar(async (contexto) => {
      const parqueos = contexto.repositorio(Parqueo);
      const parqueo = await parqueos.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!parqueo) {
        throw new ParqueoNoExiste();
      }
      if ((await contexto.repositorio(Bus).countBy({ parqueoId: id })) > 0) {
        throw new ParqueoConBuses(parqueo.codigo);
      }
      await parqueos.delete({ id });
      return parqueo.codigo;
    });
    this.eventos.publish(new ParqueoEliminado(actorId, id, codigo));
  }
}
