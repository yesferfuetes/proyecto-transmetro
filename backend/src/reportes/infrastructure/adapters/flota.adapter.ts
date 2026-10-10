import { Injectable } from '@nestjs/common';
import {
  BusConParqueo,
  ConsultasDeFlota,
  FlotaDeLineaResumen,
} from '../../../shared/contratos/flota';

/** Lo que los reportes necesitan de la flota. Es la única puerta de este módulo hacia ella. */
@Injectable()
export class FlotaAdapter {
  constructor(private readonly flota: ConsultasDeFlota) {}

  listarBuses(): Promise<BusConParqueo[]> {
    return this.flota.listarBuses();
  }

  resumenDeFlotaPorLinea(): Promise<FlotaDeLineaResumen[]> {
    return this.flota.resumenDeFlotaPorLinea();
  }
}
