import { Command } from '@nestjs/cqrs';

export interface DatosDeParqueo {
  estacionId: number;
  codigo: string;
  capacidadVehiculos: number;
}

export class RegistrarParqueo extends Command<number> {
  constructor(
    readonly datos: DatosDeParqueo,
    readonly actorId: number,
  ) {
    super();
  }
}
