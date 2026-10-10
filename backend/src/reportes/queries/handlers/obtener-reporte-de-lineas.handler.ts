import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { ReporteConsulta } from '../../entities/reporte-consulta.entity';
import { FlotaAdapter } from '../../infrastructure/adapters/flota.adapter';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { armarReporteDeLineas } from '../../services/armar-reportes';
import { paginar } from '../../services/paginacion';
import { ObtenerReporteDeLineas, ReporteDeLineas } from '../impl/obtener-reporte-de-lineas.query';
import { cargarDatos, consultaParaReporte, leerConsultaPropia } from './lectura-de-consulta';

@QueryHandler(ObtenerReporteDeLineas)
export class ObtenerReporteDeLineasHandler implements IQueryHandler<ObtenerReporteDeLineas> {
  constructor(
    @InjectRepository(ReporteConsulta) private readonly constancias: Repository<ReporteConsulta>,
    private readonly red: RedAdapter,
    private readonly flota: FlotaAdapter,
  ) {}

  async execute({ consultaId, actorId, pagina }: ObtenerReporteDeLineas): Promise<ReporteDeLineas> {
    const consulta = await leerConsultaPropia(this.constancias, consultaId, actorId, 'LINEAS');
    const datos = await cargarDatos(this.red, this.flota);
    const filas = armarReporteDeLineas(datos.red, datos.buses, datos.flota, consulta.filtros);
    return { ...paginar(filas, pagina), consulta: consultaParaReporte(consulta, datos.red) };
  }
}
