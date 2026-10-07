import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import type { Entorno } from './shared/config/entorno';
import { construirDocumento } from './shared/swagger/documento';

async function iniciar(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configuracion = app.get<ConfigService<Entorno, true>>(ConfigService);
  app.enableShutdownHooks();

  // Swagger solo fuera de producción: en Railway el backend no tiene dominio público.
  if (configuracion.get('NODE_ENV', { infer: true }) !== 'production') {
    SwaggerModule.setup('docs', app, construirDocumento(app));
  }

  // '::' acepta IPv4 e IPv6; la red privada de Railway puede resolver por IPv6.
  await app.listen(configuracion.get('PORT', { infer: true }), '::');
}

void iniciar();
