import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosModule } from './usuarios/usuarios.module';
import { RedModule } from './red/red.module';
import { AccesosModule } from './accesos/accesos.module';
import { FlotaModule } from './flota/flota.module';
import { PilotosModule } from './pilotos/pilotos.module';
import { AlertasModule } from './alertas/alertas.module';
import { ReportesModule } from './reportes/reportes.module';
import { Entorno, validarEntorno } from './shared/config/entorno';
import { opcionesDeBaseDeDatos } from './shared/database/opciones';
import { NucleoModule } from './shared/nucleo.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, validate: validarEntorno }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configuracion: ConfigService<Entorno, true>) => ({
        ...opcionesDeBaseDeDatos(configuracion.get('DATABASE_URL', { infer: true })),
        autoLoadEntities: true,
      }),
    }),
    CqrsModule.forRoot(),
    NucleoModule,
    UsuariosModule,
    RedModule,
    AccesosModule,
    FlotaModule,
    PilotosModule,
    AlertasModule,
    ReportesModule,
  ],
})
export class AppModule {}
