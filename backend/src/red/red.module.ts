import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsultasDeRed } from '../shared/contratos/red';
import { CambiarEstadoDeLineaHandler } from './commands/handlers/cambiar-estado-de-linea.handler';
import { DefinirRecorridoDeLineaHandler } from './commands/handlers/definir-recorrido-de-linea.handler';
import { EditarEstacionHandler } from './commands/handlers/editar-estacion.handler';
import { EditarLineaHandler } from './commands/handlers/editar-linea.handler';
import { EditarMunicipalidadHandler } from './commands/handlers/editar-municipalidad.handler';
import { RegistrarEstacionHandler } from './commands/handlers/registrar-estacion.handler';
import { RegistrarLineaHandler } from './commands/handlers/registrar-linea.handler';
import { RegistrarMunicipalidadHandler } from './commands/handlers/registrar-municipalidad.handler';
import { EstacionesController } from './controllers/estaciones.controller';
import { LineasController } from './controllers/lineas.controller';
import { MunicipalidadesController } from './controllers/municipalidades.controller';
import { Estacion } from './entities/estacion.entity';
import { LineaEstacion } from './entities/linea-estacion.entity';
import { Linea } from './entities/linea.entity';
import { Municipalidad } from './entities/municipalidad.entity';
import { ConsultasDeRedAdapter } from './infrastructure/adapters/consultas-de-red.adapter';
import { FlotaAdapter } from './infrastructure/adapters/flota.adapter';
import { ListarEstacionesDeLineaHandler } from './queries/handlers/listar-estaciones-de-linea.handler';
import { ListarEstacionesHandler } from './queries/handlers/listar-estaciones.handler';
import { ListarLineasHandler } from './queries/handlers/listar-lineas.handler';
import { ListarMunicipalidadesHandler } from './queries/handlers/listar-municipalidades.handler';
import { ListarOpcionesDeEstacionHandler } from './queries/handlers/listar-opciones-de-estacion.handler';
import { ObtenerEstacionHandler } from './queries/handlers/obtener-estacion.handler';
import { ObtenerEstacionesResumenHandler } from './queries/handlers/obtener-estaciones-resumen.handler';
import { ObtenerLineaHandler } from './queries/handlers/obtener-linea.handler';
import { ObtenerLineasResumenHandler } from './queries/handlers/obtener-lineas-resumen.handler';
import { ObtenerMunicipalidadHandler } from './queries/handlers/obtener-municipalidad.handler';

const MANEJADORES_DE_COMANDOS = [
  RegistrarMunicipalidadHandler,
  EditarMunicipalidadHandler,
  RegistrarEstacionHandler,
  EditarEstacionHandler,
  RegistrarLineaHandler,
  EditarLineaHandler,
  CambiarEstadoDeLineaHandler,
  DefinirRecorridoDeLineaHandler,
];

const MANEJADORES_DE_CONSULTAS = [
  ListarMunicipalidadesHandler,
  ObtenerMunicipalidadHandler,
  ListarLineasHandler,
  ObtenerLineaHandler,
  ListarEstacionesHandler,
  ObtenerEstacionHandler,
  ListarOpcionesDeEstacionHandler,
  ObtenerEstacionesResumenHandler,
  ObtenerLineasResumenHandler,
  ListarEstacionesDeLineaHandler,
];

/** Red de Transmetro. Es global para que los demás módulos consulten la red por su contrato. */
@Global()
@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([Municipalidad, Linea, Estacion, LineaEstacion])],
  controllers: [MunicipalidadesController, LineasController, EstacionesController],
  providers: [
    ...MANEJADORES_DE_COMANDOS,
    ...MANEJADORES_DE_CONSULTAS,
    FlotaAdapter,
    { provide: ConsultasDeRed, useClass: ConsultasDeRedAdapter },
  ],
  exports: [ConsultasDeRed],
})
export class RedModule {}
