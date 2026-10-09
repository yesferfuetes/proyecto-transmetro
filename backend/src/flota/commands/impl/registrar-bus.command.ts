import { Command } from '@nestjs/cqrs';

export interface DatosDeBus {
  placa: string;
  capacidadMax: number;
  parqueoId?: number | null;
  lineaId?: number | null;
}

export class RegistrarBus extends Command<number> {
  constructor(
    readonly datos: DatosDeBus,
    readonly actorId: number,
  ) {
    super();
  }
}
