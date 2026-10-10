import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { SobreDeError } from '../../shared/errors/sobre-de-error';

/** Respuestas de error comunes a las escrituras de pilotos. */
export function ErroresDeEscritura(): MethodDecorator & ClassDecorator {
  return applyDecorators(
    ApiBadRequestResponse({ type: SobreDeError, description: 'ENTRADA_INVALIDA' }),
    ApiForbiddenResponse({ type: SobreDeError, description: 'ACCESO_DENEGADO' }),
    ApiNotFoundResponse({ type: SobreDeError, description: 'PILOTO_NO_EXISTE' }),
    ApiConflictResponse({ type: SobreDeError, description: 'DPI_PILOTO_DUPLICADO' }),
    ApiUnprocessableEntityResponse({ type: SobreDeError, description: 'Regla de pilotos.' }),
  );
}

export function NoEncontrado(descripcion: string): MethodDecorator & ClassDecorator {
  return ApiNotFoundResponse({ type: SobreDeError, description: descripcion });
}
