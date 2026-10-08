import { Command } from '@nestjs/cqrs';

/** El administrador fija una contraseña nueva para otro usuario. */
export class AsignarContrasena extends Command<void> {
  constructor(
    readonly id: number,
    readonly contrasena: string,
    readonly actorId: number,
  ) {
    super();
  }
}
