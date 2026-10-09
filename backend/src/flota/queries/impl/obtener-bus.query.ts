import { Query } from '@nestjs/cqrs';
import type { BusEnVista } from './listar-buses.query';

export class ObtenerBus extends Query<BusEnVista | null> {
  constructor(readonly id: number) {
    super();
  }
}
