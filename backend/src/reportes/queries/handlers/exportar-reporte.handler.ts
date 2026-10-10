import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { ReporteConsulta } from '../../entities/reporte-consulta.entity';
import { FlotaAdapter } from '../../infrastructure/adapters/flota.adapter';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { ArchivoExportado, armarExportacion } from '../../services/exportacion';
import { ExportarReporte } from '../impl/exportar-reporte.query';
import { cargarDatos, leerConsultaPropia } from './lectura-de-consulta';

@QueryHandler(ExportarReporte)
export class ExportarReporteHandler implements IQueryHandler<ExportarReporte> {
  constructor(
    @InjectRepository(ReporteConsulta) private readonly constancias: Repository<ReporteConsulta>,
    private readonly red: RedAdapter,
    private readonly flota: FlotaAdapter,
  ) {}

  async execute({ consultaId, actorId }: ExportarReporte): Promise<ArchivoExportado> {
    const consulta = await leerConsultaPropia(this.constancias, consultaId, actorId);
    const { red, buses, flota } = await cargarDatos(this.red, this.flota);
    return armarExportacion(consulta.tipo, red, buses, flota, consulta.filtros, consulta.fechaHora);
  }
}
