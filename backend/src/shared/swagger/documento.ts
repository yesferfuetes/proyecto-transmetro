import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SobreDeError } from '../errors/sobre-de-error';

function versionDelPaquete(): string {
  const ruta = join(__dirname, '..', '..', '..', 'package.json');
  const paquete = JSON.parse(readFileSync(ruta, 'utf8')) as { version: string };
  return paquete.version;
}

export function construirDocumento(app: INestApplication): OpenAPIObject {
  const configuracion = new DocumentBuilder()
    .setTitle('Transmetro API')
    .setDescription('Sistema de Información y Control Operativo de Transmetro.')
    .setVersion(versionDelPaquete())
    // Toda ruta exige el token de sesión salvo las públicas (inicio de sesión y salud).
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'sesion')
    .addSecurityRequirements('sesion')
    .build();
  return SwaggerModule.createDocument(app, configuracion, { extraModels: [SobreDeError] });
}
