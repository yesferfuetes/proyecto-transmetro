import { Command } from '@nestjs/cqrs';
import type { DatosDeGuardia } from './registrar-guardia.command';

export class EditarGuardia extends Command<void> {
  constructor(
    readonly id: number,
    readonly datos: DatosDeGuardia,
    readonly actorId: number,
  ) {
    super();
  }
}
