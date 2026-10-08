import { Query } from '@nestjs/cqrs';
import type { LineaResumen } from '../../../shared/contratos/red';

export class ObtenerLineasResumen extends Query<LineaResumen[]> {
  constructor(readonly ids: readonly number[]) {
    super();
  }
}
