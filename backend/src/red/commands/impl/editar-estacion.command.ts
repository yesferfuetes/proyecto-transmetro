import { Command } from '@nestjs/cqrs';

/** Campos ausentes no cambian. Latitud y longitud en `null` quitan las coordenadas. */
export interface CambiosDeEstacion {
  nombre?: string;
  municipalidadId?: number;
  tieneParqueo?: boolean;
  latitud?: number | null;
  longitud?: number | null;
}

export class EditarEstacion extends Command<void> {
  constructor(
    readonly id: number,
    readonly cambios: CambiosDeEstacion,
    readonly actorId: number,
  ) {
    super();
  }
}
