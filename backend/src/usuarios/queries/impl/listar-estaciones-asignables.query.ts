import { Query } from '@nestjs/cqrs';
import type { EstacionAsignable } from './vistas';

/** Estaciones que se pueden asignar a un operador, ordenadas por código. */
export class ListarEstacionesAsignables extends Query<EstacionAsignable[]> {}
