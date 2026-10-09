import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsultasDeFlota } from '../shared/contratos/flota';
import { AsignarLineaABusHandler } from './commands/handlers/asignar-linea-a-bus.handler';
import { CambiarEstadoDeBusHandler } from './commands/handlers/cambiar-estado-de-bus.handler';
import { CambiarParqueoDeBusHandler } from './commands/handlers/cambiar-parqueo-de-bus.handler';
import { EditarBusHandler } from './commands/handlers/editar-bus.handler';
import { EditarParqueoHandler } from './commands/handlers/editar-parqueo.handler';
import { EliminarParqueoHandler } from './commands/handlers/eliminar-parqueo.handler';
import { RegistrarBusHandler } from './commands/handlers/registrar-bus.handler';
import { RegistrarParqueoHandler } from './commands/handlers/registrar-parqueo.handler';
import { BusesController } from './controllers/buses.controller';
import { FlotaPorLineaController } from './controllers/flota-por-linea.controller';
import { OpcionesController } from './controllers/opciones.controller';
import { ParqueosController } from './controllers/parqueos.controller';
import { Bus } from './entities/bus.entity';
import { Parqueo } from './entities/parqueo.entity';
import { ConsultasDeFlotaAdapter } from './infrastructure/adapters/consultas-de-flota.adapter';
import { RedAdapter } from './infrastructure/adapters/red.adapter';
import { EstacionTieneParqueosHandler } from './queries/handlers/estacion-tiene-parqueos.handler';
import { ListarBusesDeLineaHandler } from './queries/handlers/listar-buses-de-linea.handler';
import { ListarBusesHandler } from './queries/handlers/listar-buses.handler';
import { ListarFlotaPorLineaHandler } from './queries/handlers/listar-flota-por-linea.handler';
import { ListarOpcionesDeEstacionesHandler } from './queries/handlers/listar-opciones-de-estaciones.handler';
import { ListarOpcionesDeLineasHandler } from './queries/handlers/listar-opciones-de-lineas.handler';
import { ListarOpcionesDeParqueosHandler } from './queries/handlers/listar-opciones-de-parqueos.handler';
import { ListarParqueosHandler } from './queries/handlers/listar-parqueos.handler';
import { ObtenerBusHandler } from './queries/handlers/obtener-bus.handler';
import { ObtenerBusesResumenHandler } from './queries/handlers/obtener-buses-resumen.handler';
import { ObtenerParqueoHandler } from './queries/handlers/obtener-parqueo.handler';

const MANEJADORES_DE_COMANDOS = [
  RegistrarBusHandler,
  EditarBusHandler,
  AsignarLineaABusHandler,
  CambiarParqueoDeBusHandler,
  CambiarEstadoDeBusHandler,
  RegistrarParqueoHandler,
  EditarParqueoHandler,
  EliminarParqueoHandler,
];

const MANEJADORES_DE_CONSULTAS = [
  ListarBusesHandler,
  ObtenerBusHandler,
  ListarFlotaPorLineaHandler,
  ListarParqueosHandler,
  ObtenerParqueoHandler,
  ListarOpcionesDeLineasHandler,
  ListarOpcionesDeParqueosHandler,
  ListarOpcionesDeEstacionesHandler,
  EstacionTieneParqueosHandler,
  ObtenerBusesResumenHandler,
  ListarBusesDeLineaHandler,
];

/** Flota de Transmetro. Es global para que los demás módulos la consulten por su contrato. */
@Global()
@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([Bus, Parqueo])],
  controllers: [BusesController, FlotaPorLineaController, ParqueosController, OpcionesController],
  providers: [
    ...MANEJADORES_DE_COMANDOS,
    ...MANEJADORES_DE_CONSULTAS,
    RedAdapter,
    { provide: ConsultasDeFlota, useClass: ConsultasDeFlotaAdapter },
  ],
  exports: [ConsultasDeFlota],
})
export class FlotaModule {}
