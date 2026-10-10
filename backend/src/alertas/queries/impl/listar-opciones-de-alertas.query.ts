import { Query } from '@nestjs/cqrs';

export interface OpcionDeAlertas {
  id: number;
  codigo: string;
  nombre: string;
}

export interface OpcionesDeAlertas {
  estaciones: OpcionDeAlertas[];
  lineas: OpcionDeAlertas[];
}

/** Estaciones y líneas para los filtros de supervisor y administrador. */
export class ListarOpcionesDeAlertas extends Query<OpcionesDeAlertas> {}
