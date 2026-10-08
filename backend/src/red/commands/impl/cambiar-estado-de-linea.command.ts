import { Command } from '@nestjs/cqrs';

export class CambiarEstadoDeLinea extends Command<void> {
  constructor(
    readonly id: number,
    readonly estado: string,
    readonly actorId: number,
  ) {
    super();
  }
}
