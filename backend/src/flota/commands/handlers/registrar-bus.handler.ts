import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { ContextoTransaccional, UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import { Bus } from '../../entities/bus.entity';
import { Parqueo } from '../../entities/parqueo.entity';
import {
  BusSinParqueo,
  ParqueoIndicadoNoExiste,
  PlacaDuplicada,
} from '../../errors/errores-de-flota';
import { BusRegistrado } from '../../events/eventos-de-flota';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { RegistrarBus } from '../impl/registrar-bus.command';
import {
  bloquearLineas,
  exigirCupoEnParqueo,
  exigirLineaQueRecibe,
  validarCapacidadDeBus,
  validarPlaca,
} from './validaciones';

@CommandHandler(RegistrarBus)
export class RegistrarBusHandler implements ICommandHandler<RegistrarBus> {
  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly red: RedAdapter,
    private readonly eventos: EventBus,
  ) {}

  async execute({ datos, actorId }: RegistrarBus): Promise<number> {
    const placa = validarPlaca(datos.placa);
    validarCapacidadDeBus(datos.capacidadMax);
    const { parqueoId } = datos;
    if (parqueoId === null || parqueoId === undefined) {
      throw new BusSinParqueo();
    }
    const lineaId = datos.lineaId ?? null;
    const id = await this.unidadDeTrabajo.ejecutar(async (contexto) => {
      const buses = contexto.repositorio(Bus);
      await bloquearLineas(contexto, [lineaId]);
      if (lineaId !== null) {
        await exigirLineaQueRecibe(this.red, buses, lineaId);
      }
      await this.reservarParqueo(contexto, parqueoId);
      if (await buses.existsBy({ placa })) {
        throw new PlacaDuplicada(placa);
      }
      const registrado = await buses.save({
        placa,
        capacidadMax: datos.capacidadMax,
        lineaId,
        parqueoId,
        estado: 'ACTIVO',
      });
      return registrado.id;
    });
    this.eventos.publish(new BusRegistrado(actorId, id, placa, lineaId, parqueoId));
    return id;
  }

  /** Bloquea el parqueo y comprueba su cupo antes de guardar el bus. */
  private async reservarParqueo(contexto: ContextoTransaccional, parqueoId: number): Promise<void> {
    const parqueo = await contexto.repositorio(Parqueo).findOne({
      where: { id: parqueoId },
      lock: { mode: 'pessimistic_write' },
    });
    if (!parqueo) {
      throw new ParqueoIndicadoNoExiste();
    }
    await exigirCupoEnParqueo(contexto.repositorio(Bus), parqueo);
  }
}
