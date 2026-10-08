import { Query } from '@nestjs/cqrs';

export interface DetalleDeMunicipalidad {
  id: number;
  nombre: string;
  departamento: string | null;
  fechaIncorporacion: string | null;
}

export class ObtenerMunicipalidad extends Query<DetalleDeMunicipalidad | null> {
  constructor(readonly id: number) {
    super();
  }
}
