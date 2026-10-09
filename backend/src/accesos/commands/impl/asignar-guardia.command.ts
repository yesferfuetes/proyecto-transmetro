import { Command } from '@nestjs/cqrs';

export class AsignarGuardia extends Command<void> {
  constructor(
    readonly accesoId: number,
    readonly guardiaId: number,
    readonly turno: string,
    readonly actorId: number,
  ) {
    super();
  }
}
