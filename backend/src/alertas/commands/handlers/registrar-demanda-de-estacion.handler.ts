import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import { FlotaAdapter } from '../../infrastructure/adapters/flota.adapter';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { validarLectura } from '../../services/lectura';
import { crearAlertaPendiente } from '../../services/registro-de-alerta';
import { esSobrecupo } from '../../services/umbrales';
import { RegistrarDemandaDeEstacion } from '../impl/registrar-demanda-de-estacion.command';

@CommandHandler(RegistrarDemandaDeEstacion)
export class RegistrarDemandaDeEstacionHandler implements ICommandHandler<RegistrarDemandaDeEstacion> {
  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly red: RedAdapter,
    private readonly flota: FlotaAdapter,
    private readonly eventos: EventBus,
  ) {}

  async execute(comando: RegistrarDemandaDeEstacion): Promise<number | null> {
    const lectura = await validarLectura(this.red, this.flota, comando);
    if (!esSobrecupo(lectura.pasajeros, lectura.bus.capacidadMax)) {
      return null;
    }
    return crearAlertaPendiente(this.unidadDeTrabajo, this.eventos, {
      tipo: 'SOBRECUPO',
      estacionId: comando.estacionId,
      busId: comando.busId,
      porcentaje: lectura.porcentaje,
      actorId: comando.actorId,
    });
  }
}
