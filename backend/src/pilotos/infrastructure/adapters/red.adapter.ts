import { Injectable } from '@nestjs/common';
import { ConsultasDeRed, LineaResumen } from '../../../shared/contratos/red';

/** Lo que pilotos necesita de la red. Es la única puerta de este módulo hacia ella. */
@Injectable()
export class RedAdapter {
  constructor(private readonly red: ConsultasDeRed) {}

  obtenerLineas(ids: readonly number[]): Promise<LineaResumen[]> {
    return this.red.obtenerLineas(ids);
  }
}
