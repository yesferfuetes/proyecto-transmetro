import { Command } from '@nestjs/cqrs';

export interface DatosDeGuardia {
  nombre: string;
  dpi: string;
  telefono: string | null;
}

export class RegistrarGuardia extends Command<number> {
  constructor(
    readonly datos: DatosDeGuardia,
    readonly actorId: number,
  ) {
    super();
  }
}
