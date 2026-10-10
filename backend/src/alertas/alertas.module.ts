import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AtenderAlertaHandler } from './commands/handlers/atender-alerta.handler';
import { RegistrarDemandaDeEstacionHandler } from './commands/handlers/registrar-demanda-de-estacion.handler';
import { RegistrarOcupacionDeBusHandler } from './commands/handlers/registrar-ocupacion-de-bus.handler';
import { AlertasController } from './controllers/alertas.controller';
import { LecturasController } from './controllers/lecturas.controller';
import { AlertaCapacidad } from './entities/alerta-capacidad.entity';
import { FlotaAdapter } from './infrastructure/adapters/flota.adapter';
import { RedAdapter } from './infrastructure/adapters/red.adapter';
import { UsuariosAdapter } from './infrastructure/adapters/usuarios.adapter';
import { ListarAlertasHandler } from './queries/handlers/listar-alertas.handler';
import { ListarBusesParaLecturaHandler } from './queries/handlers/listar-buses-para-lectura.handler';
import { ListarOpcionesDeAlertasHandler } from './queries/handlers/listar-opciones-de-alertas.handler';
import { ObtenerHuellaDeAlertasHandler } from './queries/handlers/obtener-huella-de-alertas.handler';

const MANEJADORES_DE_COMANDOS = [
  RegistrarDemandaDeEstacionHandler,
  RegistrarOcupacionDeBusHandler,
  AtenderAlertaHandler,
];

const MANEJADORES_DE_CONSULTAS = [
  ListarAlertasHandler,
  ObtenerHuellaDeAlertasHandler,
  ListarBusesParaLecturaHandler,
  ListarOpcionesDeAlertasHandler,
];

/** Alertas de capacidad. Consulta red, flota y usuarios solo por sus contratos. */
@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([AlertaCapacidad])],
  controllers: [AlertasController, LecturasController],
  providers: [
    ...MANEJADORES_DE_COMANDOS,
    ...MANEJADORES_DE_CONSULTAS,
    RedAdapter,
    FlotaAdapter,
    UsuariosAdapter,
  ],
})
export class AlertasModule {}
