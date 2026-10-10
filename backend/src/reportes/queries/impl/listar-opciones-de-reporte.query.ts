import { Query } from '@nestjs/cqrs';

export interface OpcionesDeReporte {
  lineas: { id: number; codigo: string; nombre: string }[];
  estaciones: { id: number; codigo: string; nombre: string }[];
  municipalidades: { id: number; nombre: string }[];
  /** Usuarios que tienen constancias, para filtrar la bitácora. */
  usuarios: { id: number; nombre: string; correo: string }[];
}

export class ListarOpcionesDeReporte extends Query<OpcionesDeReporte> {}
