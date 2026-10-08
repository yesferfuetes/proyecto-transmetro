import { Query } from '@nestjs/cqrs';

export interface OpcionDeEstacion {
  id: number;
  codigo: string;
  nombre: string;
}

/** Todas las estaciones, sin paginar, con lo mínimo para elegir una. */
export class ListarOpcionesDeEstacion extends Query<OpcionDeEstacion[]> {}
