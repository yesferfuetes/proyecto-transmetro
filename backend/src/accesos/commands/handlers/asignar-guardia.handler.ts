import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import { AccesoGuardia } from '../../entities/acceso-guardia.entity';
import { Acceso } from '../../entities/acceso.entity';
import { AccesoNoExiste } from '../../errors/errores-de-accesos';
import { GuardiaAsignado } from '../../events/eventos-de-accesos';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { AsignarGuardia } from '../impl/asignar-guardia.command';
import { bloquearGuardiaAsignable, exigirTurnoValido, validarAsignacion } from './validaciones';

@CommandHandler(AsignarGuardia)
export class AsignarGuardiaHandler implements ICommandHandler<AsignarGuardia> {
  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly red: RedAdapter,
    private readonly eventos: EventBus,
  ) {}

  async execute({ accesoId, guardiaId, turno: texto, actorId }: AsignarGuardia): Promise<void> {
    const turno = exigirTurnoValido(texto);
    await this.unidadDeTrabajo.ejecutar(async (contexto) => {
      const acceso = await contexto.repositorio(Acceso).findOneBy({ id: accesoId });
      if (!acceso) {
        throw new AccesoNoExiste();
      }
      await bloquearGuardiaAsignable(contexto, guardiaId);
      await validarAsignacion(contexto, this.red, {
        accesoId,
        estacionId: acceso.estacionId,
        guardiaId,
        turno,
      });
      await contexto.repositorio(AccesoGuardia).insert({ accesoId, guardiaId, turno });
    });
    this.eventos.publish(new GuardiaAsignado(actorId, accesoId, guardiaId, turno));
  }
}
