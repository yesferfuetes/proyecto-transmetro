import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { ReporteConsulta } from '../../entities/reporte-consulta.entity';
import { FlotaAdapter } from '../../infrastructure/adapters/flota.adapter';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { agruparBuses, armarReporteDeBuses } from '../../services/armar-reportes';
import { paginar } from '../../services/paginacion';
import { ObtenerReporteDeBuses, ReporteDeBuses } from '../impl/obtener-reporte-de-buses.query';
import { cargarDatos, consultaParaReporte, leerConsultaPropia } from './lectura-de-consulta';

@QueryHandler(ObtenerReporteDeBuses)
export class ObtenerReporteDeBusesHandler implements IQueryHandler<ObtenerReporteDeBuses> {
  constructor(
    @InjectRepository(ReporteConsulta) private readonly constancias: Repository<ReporteConsulta>,
    private readonly red: RedAdapter,
    private readonly flota: FlotaAdapter,
  ) {}

  async execute({ consultaId, actorId, pagina }: ObtenerReporteDeBuses): Promise<ReporteDeBuses> {
    const consulta = await leerConsultaPropia(this.constancias, consultaId, actorId, 'BUSES');
    const datos = await cargarDatos(this.red, this.flota);
    const filas = armarReporteDeBuses(datos.red, datos.buses, consulta.filtros);
    return {
      ...paginar(filas, pagina),
      consulta: consultaParaReporte(consulta, datos.red),
      grupos: agruparBuses(filas),
    };
  }
}
