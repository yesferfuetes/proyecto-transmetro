import { Query } from '@nestjs/cqrs';
import type { BusConParqueo } from '../../../shared/contratos/flota';

/** Todos los buses con su parqueo, por placa. */
export class ListarBusesParaReporte extends Query<BusConParqueo[]> {}
