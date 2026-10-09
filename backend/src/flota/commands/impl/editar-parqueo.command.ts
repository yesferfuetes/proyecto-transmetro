import { Command } from '@nestjs/cqrs';

export class EditarParqueo extends Command<void> {
  constructor(
    readonly id: number,
    readonly capacidadVehiculos: number,
    readonly actorId: number,
  ) {
    super();
  }
}
