import { Command } from '@nestjs/cqrs';

export class AsignarBusAPiloto extends Command<void> {
  constructor(
    readonly id: number,
    readonly busId: number | null,
    readonly actorId: number,
  ) {
    super();
  }
}
