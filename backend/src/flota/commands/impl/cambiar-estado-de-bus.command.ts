import { Command } from '@nestjs/cqrs';

export class CambiarEstadoDeBus extends Command<void> {
  constructor(
    readonly id: number,
    readonly estado: string,
    readonly actorId: number,
  ) {
    super();
  }
}
