import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
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
  ],
})
export class AppModule {}
