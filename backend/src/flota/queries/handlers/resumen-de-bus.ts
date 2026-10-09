import type { BusResumen } from '../../../shared/contratos/flota';
import type { Bus } from '../../entities/bus.entity';
import { leerEstadoDeBus } from '../../services/estados-de-bus';

export function aBusResumen(bus: Bus): BusResumen {
  return {
    id: bus.id,
    placa: bus.placa,
    capacidadMax: bus.capacidadMax,
    lineaId: bus.lineaId,
    estado: leerEstadoDeBus(bus.estado),
  };
}
