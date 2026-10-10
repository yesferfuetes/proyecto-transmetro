import { Command } from '@nestjs/cqrs';

export class AtenderAlerta extends Command<void> {
  constructor(
    readonly id: number,
    readonly estacionDelActor: number | null,
    readonly actorId: number,
  ) {
    super();
  }
}
