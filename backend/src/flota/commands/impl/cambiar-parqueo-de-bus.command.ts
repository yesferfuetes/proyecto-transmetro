import { Command } from '@nestjs/cqrs';

export class CambiarParqueoDeBus extends Command<void> {
  constructor(
    readonly id: number,
    readonly parqueoId: number,
    readonly actorId: number,
  ) {
    super();
  }
}
