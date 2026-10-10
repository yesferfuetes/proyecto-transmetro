import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistrarConsultaDeReporteHandler } from './commands/handlers/registrar-consulta-de-reporte.handler';
import { BitacoraController } from './controllers/bitacora.controller';
import { ConsultasController } from './controllers/consultas.controller';
import { ReporteConsulta } from './entities/reporte-consulta.entity';
import { FlotaAdapter } from './infrastructure/adapters/flota.adapter';
import { RedAdapter } from './infrastructure/adapters/red.adapter';
import { UsuariosAdapter } from './infrastructure/adapters/usuarios.adapter';
import { ExportarReporteHandler } from './queries/handlers/exportar-reporte.handler';
import { ListarConsultasDeReporteHandler } from './queries/handlers/listar-consultas-de-reporte.handler';
import { ListarOpcionesDeReporteHandler } from './queries/handlers/listar-opciones-de-reporte.handler';
import { ObtenerReporteDeBusesHandler } from './queries/handlers/obtener-reporte-de-buses.handler';
import { ObtenerReporteDeEstacionesHandler } from './queries/handlers/obtener-reporte-de-estaciones.handler';
import { ObtenerReporteDeLineasHandler } from './queries/handlers/obtener-reporte-de-lineas.handler';

const MANEJADORES_DE_COMANDOS = [RegistrarConsultaDeReporteHandler];

const MANEJADORES_DE_CONSULTAS = [
  ObtenerReporteDeEstacionesHandler,
  ObtenerReporteDeLineasHandler,
  ObtenerReporteDeBusesHandler,
  ExportarReporteHandler,
  ListarConsultasDeReporteHandler,
  ListarOpcionesDeReporteHandler,
];

/** Reportes y bitácora de consultas. No es global: ningún otro módulo depende de él. */
@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([ReporteConsulta])],
  controllers: [ConsultasController, BitacoraController],
  providers: [
    ...MANEJADORES_DE_COMANDOS,
    ...MANEJADORES_DE_CONSULTAS,
    RedAdapter,
    FlotaAdapter,
    UsuariosAdapter,
  ],
})
export class ReportesModule {}
