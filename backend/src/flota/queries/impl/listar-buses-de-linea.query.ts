import { Query } from '@nestjs/cqrs';
import type { BusResumen } from '../../../shared/contratos/flota';

export class ListarBusesDeLinea extends Query<BusResumen[]> {
  constructor(readonly lineaId: number) {
    super();
  }
}
