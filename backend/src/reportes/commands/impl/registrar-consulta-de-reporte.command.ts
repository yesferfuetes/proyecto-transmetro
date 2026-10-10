import { Command } from '@nestjs/cqrs';
import type { FiltrosDeReporte } from '../../services/tipos-de-reporte';

/** Valida el tipo y los filtros y deja la constancia de la consulta. Devuelve su id. */
export class RegistrarConsultaDeReporte extends Command<number> {
  constructor(
    readonly tipo: string,
    readonly filtros: FiltrosDeReporte,
    readonly actorId: number,
  ) {
    super();
  }
}
