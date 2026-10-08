import { Query } from '@nestjs/cqrs';
import type { EstacionResumen } from '../../../shared/contratos/red';

/** Estaciones del recorrido de la línea, en orden. */
export class ListarEstacionesDeLinea extends Query<EstacionResumen[]> {
  constructor(readonly lineaId: number) {
    super();
  }
}
