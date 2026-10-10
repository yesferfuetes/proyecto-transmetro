import { Query } from '@nestjs/cqrs';
import type { RedCompleta } from '../../../shared/contratos/red';

/** Municipalidades, líneas con su recorrido y estaciones, en una sola lectura. */
export class ObtenerRedCompleta extends Query<RedCompleta> {}
