import { Query } from '@nestjs/cqrs';

export interface OpcionDeEstacion {
  id: number;
  codigo: string;
  nombre: string;
  tieneParqueo: boolean;
}

export class ListarOpcionesDeEstaciones extends Query<OpcionDeEstacion[]> {}
