import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsignarGuardiaHandler } from './commands/handlers/asignar-guardia.handler';
import { EditarAccesoHandler } from './commands/handlers/editar-acceso.handler';
import { EditarGuardiaHandler } from './commands/handlers/editar-guardia.handler';
import { QuitarAsignacionHandler } from './commands/handlers/quitar-asignacion.handler';
import { RegistrarAccesoHandler } from './commands/handlers/registrar-acceso.handler';
import { RegistrarGuardiaHandler } from './commands/handlers/registrar-guardia.handler';
import { AccesosController } from './controllers/accesos.controller';
import { GuardiasController } from './controllers/guardias.controller';
import { AccesoGuardia } from './entities/acceso-guardia.entity';
import { Acceso } from './entities/acceso.entity';
import { GuardiaSeguridad } from './entities/guardia-seguridad.entity';
import { RedAdapter } from './infrastructure/adapters/red.adapter';
import { ListarAccesosDeLineaHandler } from './queries/handlers/listar-accesos-de-linea.handler';
import { ListarAccesosHandler } from './queries/handlers/listar-accesos.handler';
import { ListarGuardiasHandler } from './queries/handlers/listar-guardias.handler';
import { ListarOpcionesDeEstacionHandler } from './queries/handlers/listar-opciones-de-estacion.handler';
import { ListarOpcionesDeGuardiaHandler } from './queries/handlers/listar-opciones-de-guardia.handler';
import { ObtenerAccesoHandler } from './queries/handlers/obtener-acceso.handler';
import { ObtenerGuardiaHandler } from './queries/handlers/obtener-guardia.handler';

const MANEJADORES_DE_COMANDOS = [
  RegistrarAccesoHandler,
  EditarAccesoHandler,
  RegistrarGuardiaHandler,
  EditarGuardiaHandler,
  AsignarGuardiaHandler,
  QuitarAsignacionHandler,
];

const MANEJADORES_DE_CONSULTAS = [
  ListarAccesosHandler,
  ObtenerAccesoHandler,
  ListarAccesosDeLineaHandler,
  ListarGuardiasHandler,
  ObtenerGuardiaHandler,
  ListarOpcionesDeGuardiaHandler,
  ListarOpcionesDeEstacionHandler,
];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([Acceso, GuardiaSeguridad, AccesoGuardia])],
  controllers: [AccesosController, GuardiasController],
  providers: [...MANEJADORES_DE_COMANDOS, ...MANEJADORES_DE_CONSULTAS, RedAdapter],
})
export class AccesosModule {}
