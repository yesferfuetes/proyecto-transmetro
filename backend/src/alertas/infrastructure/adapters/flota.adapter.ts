import { Injectable } from '@nestjs/common';
import { BusResumen, ConsultasDeFlota } from '../../../shared/contratos/flota';

/** Lo que las alertas necesitan de la flota. Es la única puerta de este módulo hacia ella. */
@Injectable()
export class FlotaAdapter {
  constructor(private readonly flota: ConsultasDeFlota) {}

  obtenerBus(id: number): Promise<BusResumen | null> {
    return this.flota.obtenerBus(id);
  }

  obtenerBuses(ids: readonly number[]): Promise<BusResumen[]> {
    return this.flota.obtenerBuses(ids);
  }

  busesDeLinea(lineaId: number): Promise<BusResumen[]> {
    return this.flota.busesDeLinea(lineaId);
  }
}
