import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import { Acceso } from '../../entities/acceso.entity';
import { AccesoNoExiste } from '../../errors/errores-de-accesos';
import { AccesoEditado } from '../../events/eventos-de-accesos';
import { recortarONulo } from '../../services/normalizacion';
import { EditarAcceso } from '../impl/editar-acceso.command';

@CommandHandler(EditarAcceso)
export class EditarAccesoHandler implements ICommandHandler<EditarAcceso> {
  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly eventos: EventBus,
  ) {}

  async execute({ id, nombre, actorId }: EditarAcceso): Promise<void> {
    await this.unidadDeTrabajo.ejecutar(async (contexto) => {
      const accesos = contexto.repositorio(Acceso);
      if (!(await accesos.existsBy({ id }))) {
        throw new AccesoNoExiste();
      }
      await accesos.update({ id }, { nombre: recortarONulo(nombre) });
    });
    this.eventos.publish(new AccesoEditado(actorId, id, ['nombre']));
  }
}
