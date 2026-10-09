import { Command } from '@nestjs/cqrs';

/** El código y la estación no cambian; un nombre vacío quita el nombre. */
export class EditarAcceso extends Command<void> {
  constructor(
    readonly id: number,
    readonly nombre: string | null,
    readonly actorId: number,
  ) {
    super();
  }
}
