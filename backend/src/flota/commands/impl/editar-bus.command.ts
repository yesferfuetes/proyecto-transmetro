import { Command } from '@nestjs/cqrs';

export class EditarBus extends Command<void> {
  constructor(
    readonly id: number,
    readonly capacidadMax: number,
    readonly actorId: number,
  ) {
    super();
  }
}
