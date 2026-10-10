import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsignarBusAPilotoHandler } from './commands/handlers/asignar-bus-a-piloto.handler';
import { EditarPilotoHandler } from './commands/handlers/editar-piloto.handler';
import { RegistrarPilotoHandler } from './commands/handlers/registrar-piloto.handler';
import { PilotosController } from './controllers/pilotos.controller';
import { Piloto } from './entities/piloto.entity';
import { FlotaAdapter } from './infrastructure/adapters/flota.adapter';
import { RedAdapter } from './infrastructure/adapters/red.adapter';
import { ListarOpcionesDePilotosHandler } from './queries/handlers/listar-opciones-de-pilotos.handler';
import { ListarPilotosHandler } from './queries/handlers/listar-pilotos.handler';
import { ObtenerPilotoHandler } from './queries/handlers/obtener-piloto.handler';

const MANEJADORES_DE_COMANDOS = [
  RegistrarPilotoHandler,
  EditarPilotoHandler,
  AsignarBusAPilotoHandler,
];

const MANEJADORES_DE_CONSULTAS = [
  ListarPilotosHandler,
  ObtenerPilotoHandler,
  ListarOpcionesDePilotosHandler,
];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([Piloto])],
  controllers: [PilotosController],
  providers: [...MANEJADORES_DE_COMANDOS, ...MANEJADORES_DE_CONSULTAS, FlotaAdapter, RedAdapter],
})
export class PilotosModule {}
