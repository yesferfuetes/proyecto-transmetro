import { Command } from '@nestjs/cqrs';

export interface CambiosDeLinea {
  nombre?: string;
  municipalidadId?: number;
}

export class EditarLinea extends Command<void> {
  constructor(
    readonly id: number,
    readonly cambios: CambiosDeLinea,
    readonly actorId: number,
  ) {
    super();
  }
}
