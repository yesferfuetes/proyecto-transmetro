import { ValidationError, ValidationPipe } from '@nestjs/common';
import { DetalleDeError, ErrorDeEntrada } from './error-de-negocio';

/** Validación de entrada: rechaza propiedades no declaradas y transforma tipos. */
export function crearTuboDeValidacion(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errores: ValidationError[]) => new ErrorDeEntrada(aplanar(errores)),
  });
}

function aplanar(errores: ValidationError[], prefijo = ''): DetalleDeError[] {
  return errores.flatMap((error) => {
    const campo = prefijo ? `${prefijo}.${error.property}` : error.property;
    const propios: DetalleDeError[] = error.constraints
      ? [{ campo, mensajes: Object.values(error.constraints) }]
      : [];
    return [...propios, ...aplanar(error.children ?? [], campo)];
  });
}
