import { Query } from '@nestjs/cqrs';
import type { MiCuenta } from './vistas';

export class ObtenerMiCuenta extends Query<MiCuenta> {
  constructor(readonly id: number) {
    super();
  }
}
