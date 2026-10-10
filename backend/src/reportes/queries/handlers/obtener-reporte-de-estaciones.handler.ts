import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { ReporteConsulta } from '../../entities/reporte-consulta.entity';
import { FlotaAdapter } from '../../infrastructure/adapters/flota.adapter';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { armarReporteDeEstaciones } from '../../services/armar-reportes';
import { paginar } from '../../services/paginacion';
import {
  ObtenerReporteDeEstaciones,
  ReporteDeEstaciones,
} from '../impl/obtener-reporte-de-estaciones.query';
import { cargarDatos, consultaParaReporte, leerConsultaPropia } from './lectura-de-consulta';

@QueryHandler(ObtenerReporteDeEstaciones)
export class ObtenerReporteDeEstacionesHandler implements IQueryHandler<ObtenerReporteDeEstaciones> {
  constructor(
    @InjectRepository(ReporteConsulta) private readonly constancias: Repository<ReporteConsulta>,
    private readonly red: RedAdapter,
    private readonly flota: FlotaAdapter,
  ) {}

  async execute({
    consultaId,
    actorId,
    pagina,
  }: ObtenerReporteDeEstaciones): Promise<ReporteDeEstaciones> {
    const consulta = await leerConsultaPropia(this.constancias, consultaId, actorId, 'ESTACIONES');
    const datos = await cargarDatos(this.red, this.flota);
    const filas = armarReporteDeEstaciones(datos.red, datos.buses, consulta.filtros);
    return { ...paginar(filas, pagina), consulta: consultaParaReporte(consulta, datos.red) };
  }
}
