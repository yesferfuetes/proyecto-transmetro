import { Command } from '@nestjs/cqrs';

export interface DatosDeLinea {
  codigo: string;
  nombre: string;
  municipalidadId: number;
  estado: string;
}

export class RegistrarLinea extends Command<number> {
  constructor(
    readonly datos: DatosDeLinea,
    readonly actorId: number,
  ) {
    super();
  }
}
