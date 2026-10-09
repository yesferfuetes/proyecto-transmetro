import { Query } from '@nestjs/cqrs';

export interface OpcionDeGuardia {
  id: number;
  nombre: string;
  dpi: string;
}

export class ListarOpcionesDeGuardia extends Query<OpcionDeGuardia[]> {}
