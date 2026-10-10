import { Command } from '@nestjs/cqrs';
import type { DatosDePiloto } from '../../services/validaciones';

export class EditarPiloto extends Command<void> {
  constructor(
    readonly id: number,
    readonly datos: DatosDePiloto,
    readonly actorId: number,
  ) {
    super();
  }
}
