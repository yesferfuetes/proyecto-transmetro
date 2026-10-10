import { Command } from '@nestjs/cqrs';

/** Devuelve el id de la alerta creada, o null si la ocupación no la merece. */
export class RegistrarOcupacionDeBus extends Command<number | null> {
  constructor(
    readonly estacionId: number,
    readonly busId: number,
    readonly pasajeros: number | null,
    readonly estacionDelActor: number | null,
    readonly actorId: number,
  ) {
    super();
  }
}
