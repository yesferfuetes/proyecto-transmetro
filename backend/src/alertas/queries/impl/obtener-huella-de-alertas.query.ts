import { Query } from '@nestjs/cqrs';

/** Resumen barato para saber si la lista cambió. `ultimaId` es 0 mientras no hay alertas. */
export interface HuellaDeAlertas {
  pendientes: number;
  atendidas: number;
  ultimaId: number;
}

export class ObtenerHuellaDeAlertas extends Query<HuellaDeAlertas> {
  constructor(readonly estacionId?: number) {
    super();
  }
}
