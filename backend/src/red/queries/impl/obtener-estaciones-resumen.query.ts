import { Query } from '@nestjs/cqrs';
import type { EstacionResumen } from '../../../shared/contratos/red';

/** Sin ids, todas las estaciones. */
export class ObtenerEstacionesResumen extends Query<EstacionResumen[]> {
  constructor(readonly ids?: readonly number[]) {
    super();
  }
}
