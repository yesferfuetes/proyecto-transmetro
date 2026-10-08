import { Command } from '@nestjs/cqrs';

/** Devuelve el id del usuario que abrió sesión. */
export class IniciarSesion extends Command<number> {
  constructor(
    readonly correo: string,
    readonly contrasena: string,
  ) {
    super();
  }
}
