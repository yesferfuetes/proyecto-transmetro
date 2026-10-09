import { Command } from '@nestjs/cqrs';

export class EliminarParqueo extends Command<void> {
  constructor(
    readonly id: number,
    readonly actorId: number,
  ) {
    super();
  }
}
