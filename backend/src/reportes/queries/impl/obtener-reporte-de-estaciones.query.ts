import { Query } from '@nestjs/cqrs';
import type { Pagina, SolicitudDePagina } from '../../services/paginacion';
import type { ConsultaDeReporte, FilaDeEstacion } from '../../services/tipos-de-reporte';

export type ReporteDeEstaciones = Pagina<FilaDeEstacion> & { consulta: ConsultaDeReporte };

export class ObtenerReporteDeEstaciones extends Query<ReporteDeEstaciones> {
  constructor(
    readonly consultaId: number,
    readonly actorId: number,
    readonly pagina: SolicitudDePagina,
  ) {
    super();
  }
}
