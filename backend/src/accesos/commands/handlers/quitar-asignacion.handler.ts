import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import { AccesoGuardia } from '../../entities/acceso-guardia.entity';
import { Acceso } from '../../entities/acceso.entity';
import {
  AccesoNoExiste,
  AsignacionNoExiste,
  UltimaAsignacionDelAcceso,
} from '../../errors/errores-de-accesos';
import { AsignacionQuitada } from '../../events/eventos-de-accesos';
import { normalizarTurno } from '../../services/turnos';
import { QuitarAsignacion } from '../impl/quitar-asignacion.command';

@CommandHandler(QuitarAsignacion)
export class QuitarAsignacionHandler implements ICommandHandler<QuitarAsignacion> {
  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly eventos: EventBus,
  ) {}

  async execute({ accesoId, guardiaId, turno: texto, actorId }: QuitarAsignacion): Promise<void> {
    const turno = normalizarTurno(texto) ?? texto;
    await this.unidadDeTrabajo.ejecutar(async (contexto) => {
      // La fila del acceso queda bloqueada: dos retiros simultáneos no pueden dejarlo sin guardia.
      const acceso = await contexto
        .repositorio(Acceso)
        .findOne({ where: { id: accesoId }, lock: { mode: 'pessimistic_write' } });
      if (!acceso) {
        throw new AccesoNoExiste();
      }
      const asignaciones = contexto.repositorio(AccesoGuardia);
      if (!(await asignaciones.existsBy({ accesoId, guardiaId, turno }))) {
        throw new AsignacionNoExiste();
      }
      if ((await asignaciones.countBy({ accesoId })) <= 1) {
        throw new UltimaAsignacionDelAcceso();
      }
      await asignaciones.delete({ accesoId, guardiaId, turno });
    });
    this.eventos.publish(new AsignacionQuitada(actorId, accesoId, guardiaId, turno));
  }
}
