import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import type { EstadoDeBus } from '../../../shared/contratos/flota';
import { ContextoTransaccional, UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import { Bus } from '../../entities/bus.entity';
import { BusDeBaja, BusNoExiste, EstadoBusInvalido } from '../../errors/errores-de-flota';
import { EstadoDeBusCambiado } from '../../events/eventos-de-flota';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { esEstadoDeBus } from '../../services/estados-de-bus';
import { CambiarEstadoDeBus } from '../impl/cambiar-estado-de-bus.command';
import { bloquearLineas, exigirMinimoAlQuitar } from './validaciones';

interface Resultado {
  anterior: string;
  lineaQuitada: boolean;
}

@CommandHandler(CambiarEstadoDeBus)
export class CambiarEstadoDeBusHandler implements ICommandHandler<CambiarEstadoDeBus> {
  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly red: RedAdapter,
    private readonly eventos: EventBus,
  ) {}

  async execute({ id, estado, actorId }: CambiarEstadoDeBus): Promise<void> {
    if (!esEstadoDeBus(estado)) {
      throw new EstadoBusInvalido();
    }
    const { anterior, lineaQuitada } = await this.unidadDeTrabajo.ejecutar(async (contexto) => {
      const buses = contexto.repositorio(Bus);
      const bus = await buses.findOne({ where: { id }, lock: { mode: 'pessimistic_write' } });
      if (!bus) {
        throw new BusNoExiste();
      }
      if (bus.estado === 'BAJA') {
        throw new BusDeBaja();
      }
      if (bus.estado === estado) {
        return { anterior: bus.estado, lineaQuitada: false };
      }
      return await this.aplicar(contexto, bus, estado);
    });
    if (anterior !== estado) {
      this.eventos.publish(new EstadoDeBusCambiado(actorId, id, anterior, estado, lineaQuitada));
    }
  }

  /** Dar de baja quita la línea en la misma operación, con la regla del mínimo. */
  private async aplicar(
    contexto: ContextoTransaccional,
    bus: Bus,
    estado: EstadoDeBus,
  ): Promise<Resultado> {
    const buses = contexto.repositorio(Bus);
    const { lineaId } = bus;
    const quitaLinea = estado === 'BAJA' && lineaId !== null;
    if (quitaLinea) {
      await bloquearLineas(contexto, [lineaId]);
      await exigirMinimoAlQuitar(this.red, buses, lineaId);
    }
    await buses.update({ id: bus.id }, quitaLinea ? { estado, lineaId: null } : { estado });
    return { anterior: bus.estado, lineaQuitada: quitaLinea };
  }
}
