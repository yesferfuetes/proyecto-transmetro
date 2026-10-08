import { Command } from '@nestjs/cqrs';

export class CambiarMiContrasena extends Command<void> {
  constructor(
    readonly actorId: number,
    readonly contrasenaActual: string,
    readonly contrasenaNueva: string,
  ) {
    super();
  }
}
