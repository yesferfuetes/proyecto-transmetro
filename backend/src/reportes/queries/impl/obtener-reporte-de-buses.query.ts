import { Query } from '@nestjs/cqrs';
import type { Pagina, SolicitudDePagina } from '../../services/paginacion';
import type { ConsultaDeReporte, FilaDeBus, GrupoDeBuses } from '../../services/tipos-de-reporte';

export type ReporteDeBuses = Pagina<FilaDeBus> & {
  consulta: ConsultaDeReporte;
  grupos: GrupoDeBuses[];
};

export class ObtenerReporteDeBuses extends Query<ReporteDeBuses> {
  constructor(
    readonly consultaId: number,
    readonly actorId: number,
    readonly pagina: SolicitudDePagina,
  ) {
    super();
  }
}
