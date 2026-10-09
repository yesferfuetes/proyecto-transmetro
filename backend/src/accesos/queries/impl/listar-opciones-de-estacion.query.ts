import { Query } from '@nestjs/cqrs';
import type { ReferenciaDeEstacion } from './listar-accesos.query';

export class ListarOpcionesDeEstacion extends Query<ReferenciaDeEstacion[]> {}
