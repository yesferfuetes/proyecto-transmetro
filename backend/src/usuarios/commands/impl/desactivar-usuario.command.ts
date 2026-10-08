import { Command } from '@nestjs/cqrs';

export class DesactivarUsuario extends Command<void> {
  constructor(
    readonly id: number,
    readonly actorId: number,
  ) {
    super();
  }
}
