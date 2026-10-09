import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Not } from 'typeorm';
import { UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import { GuardiaSeguridad } from '../../entities/guardia-seguridad.entity';
import { DpiGuardiaDuplicado, GuardiaNoExiste } from '../../errors/errores-de-accesos';
import { GuardiaEditado } from '../../events/eventos-de-accesos';
import { EditarGuardia } from '../impl/editar-guardia.command';
import type { DatosDeGuardia } from '../impl/registrar-guardia.command';
import { normalizarDatosDeGuardia } from './validaciones';

const CAMPOS: (keyof DatosDeGuardia)[] = ['nombre', 'dpi', 'telefono'];

@CommandHandler(EditarGuardia)
export class EditarGuardiaHandler implements ICommandHandler<EditarGuardia> {
  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly eventos: EventBus,
  ) {}

  async execute({ id, datos, actorId }: EditarGuardia): Promise<void> {
    const nuevos = normalizarDatosDeGuardia(datos);
    const campos = await this.unidadDeTrabajo.ejecutar(async (contexto) => {
      const guardias = contexto.repositorio(GuardiaSeguridad);
      const actual = await guardias.findOneBy({ id });
      if (!actual) {
        throw new GuardiaNoExiste();
      }
      if (await guardias.existsBy({ dpi: nuevos.dpi, id: Not(id) })) {
        throw new DpiGuardiaDuplicado();
      }
      await guardias.update({ id }, nuevos);
      return CAMPOS.filter((campo) => actual[campo] !== nuevos[campo]);
    });
    this.eventos.publish(new GuardiaEditado(actorId, id, campos));
  }
}
