import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import { Bus } from '../../entities/bus.entity';
import { Parqueo } from '../../entities/parqueo.entity';
import { CapacidadParqueoInsuficiente, ParqueoNoExiste } from '../../errors/errores-de-flota';
import { ParqueoEditado } from '../../events/eventos-de-flota';
import { EditarParqueo } from '../impl/editar-parqueo.command';
import { validarCapacidadDeParqueo } from './validaciones';

@CommandHandler(EditarParqueo)
export class EditarParqueoHandler implements ICommandHandler<EditarParqueo> {
  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly eventos: EventBus,
  ) {}

  async execute({ id, capacidadVehiculos, actorId }: EditarParqueo): Promise<void> {
    validarCapacidadDeParqueo(capacidadVehiculos);
    const cambio = await this.unidadDeTrabajo.ejecutar(async (contexto) => {
      const parqueos = contexto.repositorio(Parqueo);
      const parqueo = await parqueos.findOne({
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!parqueo) {
        throw new ParqueoNoExiste();
      }
      const guardados = await contexto.repositorio(Bus).countBy({ parqueoId: id });
      if (capacidadVehiculos < guardados) {
        throw new CapacidadParqueoInsuficiente(parqueo.codigo, guardados);
      }
      if (parqueo.capacidadVehiculos === capacidadVehiculos) {
        return false;
      }
      await parqueos.update({ id }, { capacidadVehiculos });
      return true;
    });
    if (cambio) {
      this.eventos.publish(new ParqueoEditado(actorId, id, capacidadVehiculos));
    }
  }
}
