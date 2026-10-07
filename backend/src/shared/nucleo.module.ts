import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { TerminusModule } from '@nestjs/terminus';
import { UnidadDeTrabajo, UnidadDeTrabajoTypeorm } from './database/unidad-de-trabajo';
import { FiltroDeExcepciones } from './errors/filtro-de-excepciones';
import { crearTuboDeValidacion } from './errors/tubo-de-validacion';
import { SaludController } from './health/salud.controller';

/** Piezas técnicas transversales, sin negocio. */
@Global()
@Module({
  imports: [TerminusModule],
  controllers: [SaludController],
  providers: [
    { provide: APP_FILTER, useClass: FiltroDeExcepciones },
    { provide: APP_PIPE, useFactory: crearTuboDeValidacion },
    { provide: UnidadDeTrabajo, useClass: UnidadDeTrabajoTypeorm },
  ],
  exports: [UnidadDeTrabajo],
})
export class NucleoModule {}
