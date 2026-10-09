import { Command } from '@nestjs/cqrs';

export interface DatosDeAcceso {
  estacionId: number;
  codigo: string;
  nombre: string | null;
  /** Primer guardia del acceso; sin él no se registra. */
  guardiaId: number | null;
  turno: string;
}

export class RegistrarAcceso extends Command<number> {
  constructor(
    readonly datos: DatosDeAcceso,
    readonly actorId: number,
  ) {
    super();
  }
}
