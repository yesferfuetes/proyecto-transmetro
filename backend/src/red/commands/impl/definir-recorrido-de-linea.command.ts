import { Command } from '@nestjs/cqrs';

export interface Parada {
  estacionId: number;
  distanciaSiguienteKm: number | null;
}

/** Reemplaza el recorrido completo de la línea por las paradas dadas, en orden. */
export class DefinirRecorridoDeLinea extends Command<void> {
  constructor(
    readonly lineaId: number,
    readonly paradas: readonly Parada[],
    readonly actorId: number,
  ) {
    super();
  }
}
