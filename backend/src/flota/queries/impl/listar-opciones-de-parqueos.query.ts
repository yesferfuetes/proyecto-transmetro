import { Query } from '@nestjs/cqrs';

export interface OpcionDeParqueo {
  id: number;
  codigo: string;
  capacidadVehiculos: number;
  buses: number;
  estacion: { id: number; codigo: string; nombre: string };
}

/** Parqueos con cupo para un bus más. */
export class ListarOpcionesDeParqueos extends Query<OpcionDeParqueo[]> {}
