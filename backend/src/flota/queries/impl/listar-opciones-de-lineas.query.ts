import { Query } from '@nestjs/cqrs';

export interface OpcionDeLinea {
  id: number;
  codigo: string;
  nombre: string;
  estaciones: number;
  buses: number;
  maximo: number;
}

/** Líneas que pueden recibir buses: las que no están inactivas. */
export class ListarOpcionesDeLineas extends Query<OpcionDeLinea[]> {}
