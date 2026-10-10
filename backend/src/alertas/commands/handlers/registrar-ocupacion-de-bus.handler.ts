import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UnidadDeTrabajo } from '../../../shared/database/unidad-de-trabajo';
import { PasajerosExcedenCapacidad } from '../../errors/errores-de-alertas';
import { FlotaAdapter } from '../../infrastructure/adapters/flota.adapter';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { validarLectura } from '../../services/lectura';
import { crearAlertaPendiente } from '../../services/registro-de-alerta';
import { esBajaOcupacion } from '../../services/umbrales';
import { RegistrarOcupacionDeBus } from '../impl/registrar-ocupacion-de-bus.command';

@CommandHandler(RegistrarOcupacionDeBus)
export class RegistrarOcupacionDeBusHandler implements ICommandHandler<RegistrarOcupacionDeBus> {
  constructor(
    private readonly unidadDeTrabajo: UnidadDeTrabajo,
    private readonly red: RedAdapter,
    private readonly flota: FlotaAdapter,
    private readonly eventos: EventBus,
  ) {}

  async execute(comando: RegistrarOcupacionDeBus): Promise<number | null> {
    const lectura = await validarLectura(this.red, this.flota, comando);
    const capacidad = lectura.bus.capacidadMax;
    if (lectura.pasajeros > capacidad) {
      throw new PasajerosExcedenCapacidad(capacidad);
    }
    if (!esBajaOcupacion(lectura.pasajeros, capacidad)) {
      return null;
    }
    return crearAlertaPendiente(this.unidadDeTrabajo, this.eventos, {
      tipo: 'BAJA_OCUPACION',
      estacionId: comando.estacionId,
      busId: comando.busId,
      porcentaje: lectura.porcentaje,
      actorId: comando.actorId,
    });
  }
}
