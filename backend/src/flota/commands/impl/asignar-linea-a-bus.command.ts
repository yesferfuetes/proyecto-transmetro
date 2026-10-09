import { Command } from '@nestjs/cqrs';

export class AsignarLineaABus extends Command<void> {
  constructor(
    readonly id: number,
    readonly lineaId: number | null,
    readonly actorId: number,
  ) {
    super();
  }
}
