import { NestFactory } from '@nestjs/core';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { AppModule } from './app.module';
import { construirDocumento } from './shared/swagger/documento';

/** Escribe openapi.json sin abrir conexión a la base: el modo preview no instancia proveedores. */
async function generar(): Promise<void> {
  const app = await NestFactory.create(AppModule, { preview: true, logger: false });
  const documento = construirDocumento(app);
  writeFileSync(join(process.cwd(), 'openapi.json'), `${JSON.stringify(documento, null, 2)}\n`);
  await app.close();
}

void generar();
