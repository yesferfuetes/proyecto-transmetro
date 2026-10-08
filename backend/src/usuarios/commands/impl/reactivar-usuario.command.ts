import { Command } from '@nestjs/cqrs';

export class ReactivarUsuario extends Command<void> {
  constructor(
    readonly id: number,
    readonly actorId: number,
  ) {
    super();
  }
}
