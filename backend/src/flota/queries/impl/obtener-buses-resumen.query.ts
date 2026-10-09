import { Query } from '@nestjs/cqrs';
import type { BusResumen } from '../../../shared/contratos/flota';

export class ObtenerBusesResumen extends Query<BusResumen[]> {
  constructor(readonly ids: readonly number[]) {
    super();
  }
}
