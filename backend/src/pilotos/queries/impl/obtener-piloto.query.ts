import { Query } from '@nestjs/cqrs';
import type { PilotoEnListadoCompleto, PilotoReducido } from './listar-pilotos.query';

export interface DetalleCompletoDePiloto extends PilotoEnListadoCompleto {
  direccionResidencia: string | null;
  correo: string | null;
  historialEducativo: string | null;
}

export type DetalleDePiloto = PilotoReducido | DetalleCompletoDePiloto;

export class ObtenerPiloto extends Query<DetalleDePiloto | null> {
  constructor(
    readonly id: number,
    readonly completo: boolean,
  ) {
    super();
  }
}
