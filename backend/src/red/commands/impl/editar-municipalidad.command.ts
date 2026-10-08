import { Command } from '@nestjs/cqrs';

export interface CambiosDeMunicipalidad {
  nombre?: string;
  departamento?: string | null;
  fechaIncorporacion?: string | null;
}

export class EditarMunicipalidad extends Command<void> {
  constructor(
    readonly id: number,
    readonly cambios: CambiosDeMunicipalidad,
    readonly actorId: number,
  ) {
    super();
  }
}
