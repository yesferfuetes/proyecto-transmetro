import { Query } from '@nestjs/cqrs';

export interface ParqueoEnVista {
  id: number;
  codigo: string;
  capacidadVehiculos: number;
  buses: number;
  estacion: { id: number; codigo: string; nombre: string };
}

export class ListarParqueos extends Query<ParqueoEnVista[]> {}
