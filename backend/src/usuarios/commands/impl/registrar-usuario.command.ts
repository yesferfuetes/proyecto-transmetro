import { Command } from '@nestjs/cqrs';

/** Devuelve el id del usuario nuevo. `rol` llega como texto: lo valida el handler. */
export class RegistrarUsuario extends Command<number> {
  constructor(
    readonly nombre: string,
    readonly correo: string,
    readonly rol: string,
    readonly contrasena: string,
    readonly estacionId: number | null,
    readonly actorId: number,
  ) {
    super();
  }
}
