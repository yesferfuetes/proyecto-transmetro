import { Query } from '@nestjs/cqrs';

export interface OpcionesDePilotos {
  buses: {
    id: number;
    placa: string;
    linea: { id: number; codigo: string; nombre: string } | null;
    pilotos: number;
  }[];
  lineas: { id: number; codigo: string; nombre: string }[];
}

/** Buses que no están de baja y líneas que tienen buses, para los formularios y filtros. */
export class ListarOpcionesDePilotos extends Query<OpcionesDePilotos> {}
