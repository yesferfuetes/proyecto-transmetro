import { Injectable } from '@nestjs/common';
import { ConsultasDeFlota } from '../../../shared/contratos/flota';

/** Lo que la red necesita saber de la flota, a través del contrato de flota. */
@Injectable()
export class FlotaAdapter {
  constructor(private readonly consultas: ConsultasDeFlota) {}

  estacionTieneParqueos(estacionId: number): Promise<boolean> {
    return this.consultas.estacionTieneParqueos(estacionId);
  }
}
