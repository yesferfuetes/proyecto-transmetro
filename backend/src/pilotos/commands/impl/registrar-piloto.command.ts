import { Command } from '@nestjs/cqrs';
import type { DatosDePiloto } from '../../services/validaciones';

export class RegistrarPiloto extends Command<number> {
  constructor(
    readonly datos: DatosDePiloto,
    readonly busId: number | null,
    readonly actorId: number,
  ) {
    super();
  }
}
