import { Command } from '@nestjs/cqrs';

/** Devuelve el id de la alerta creada, o null si la demanda no la merece. */
export class RegistrarDemandaDeEstacion extends Command<number | null> {
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
