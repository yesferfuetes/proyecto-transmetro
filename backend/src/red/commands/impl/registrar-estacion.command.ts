import { Command } from '@nestjs/cqrs';

export interface DatosDeEstacion {
  codigo: string;
  nombre: string;
  municipalidadId: number;
  tieneParqueo: boolean;
  latitud: number | null;
  longitud: number | null;
}

export class RegistrarEstacion extends Command<number> {
  constructor(
    readonly datos: DatosDeEstacion,
    readonly actorId: number,
  ) {
    super();
  }
}
