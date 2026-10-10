import { Query } from '@nestjs/cqrs';
import type { Pagina, SolicitudDePagina } from '../../services/paginacion';
import type { ConsultaDeReporte, FilaDeLinea } from '../../services/tipos-de-reporte';

export type ReporteDeLineas = Pagina<FilaDeLinea> & { consulta: ConsultaDeReporte };

export class ObtenerReporteDeLineas extends Query<ReporteDeLineas> {
  constructor(
    readonly consultaId: number,
    readonly actorId: number,
    readonly pagina: SolicitudDePagina,
  ) {
    super();
  }
}
