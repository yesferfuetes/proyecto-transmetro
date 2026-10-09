import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import { GuardiaSeguridad } from '../../entities/guardia-seguridad.entity';
import { DpiGuardiaDuplicado } from '../../errors/errores-de-accesos';
import { GuardiaRegistrado } from '../../events/eventos-de-accesos';
import { RegistrarGuardia } from '../impl/registrar-guardia.command';
import { normalizarDatosDeGuardia } from './validaciones';

@CommandHandler(RegistrarGuardia)
export class RegistrarGuardiaHandler implements ICommandHandler<RegistrarGuardia> {
  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly eventos: EventBus,
  ) {}

  async execute({ datos, actorId }: RegistrarGuardia): Promise<number> {
    const guardia = normalizarDatosDeGuardia(datos);
    const id = await this.unidadDeTrabajo.ejecutar(async (contexto) => {
      const guardias = contexto.repositorio(GuardiaSeguridad);
      if (await guardias.existsBy({ dpi: guardia.dpi })) {
        throw new DpiGuardiaDuplicado();
      }
      const registrado = await guardias.save(guardia);
      return registrado.id;
    });
    this.eventos.publish(new GuardiaRegistrado(actorId, id));
    return id;
  }
}
