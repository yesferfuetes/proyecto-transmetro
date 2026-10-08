import { Command } from '@nestjs/cqrs';

export interface CambiosDeUsuario {
  nombre?: string;
  correo?: string;
  rol?: string;
  /** `null` retira la estación; si no viene, se conserva la que tenía. */
  estacionId?: number | null;
}

export class EditarUsuario extends Command<void> {
  constructor(
    readonly id: number,
    readonly cambios: CambiosDeUsuario,
    readonly actorId: number,
  ) {
    super();
  }
}
