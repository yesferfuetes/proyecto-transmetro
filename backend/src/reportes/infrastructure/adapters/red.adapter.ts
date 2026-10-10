import { Injectable } from '@nestjs/common';
import { ConsultasDeRed, RedCompleta } from '../../../shared/contratos/red';

/** Lo que los reportes necesitan de la red. Es la única puerta de este módulo hacia ella. */
@Injectable()
export class RedAdapter {
  constructor(private readonly red: ConsultasDeRed) {}

  obtenerRed(): Promise<RedCompleta> {
    return this.red.obtenerRed();
  }
}
