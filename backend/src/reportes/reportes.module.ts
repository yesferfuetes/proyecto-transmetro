import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReporteConsulta } from './entities/reporte-consulta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReporteConsulta])],
})
export class ReportesModule {}
