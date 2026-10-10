import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { SobreDeError } from '../../shared/errors/sobre-de-error';

/** Respuestas de error comunes a las escrituras de alertas. */
export function ErroresDeEscritura(): MethodDecorator & ClassDecorator {
  return applyDecorators(
    ApiBadRequestResponse({ type: SobreDeError, description: 'ENTRADA_INVALIDA' }),
    ApiForbiddenResponse({ type: SobreDeError, description: 'ACCESO_DENEGADO o ESTACION_AJENA' }),
    ApiNotFoundResponse({ type: SobreDeError, description: 'ALERTA_NO_EXISTE' }),
    ApiConflictResponse({
      type: SobreDeError,
      description: 'ALERTA_PENDIENTE_EXISTENTE o ALERTA_YA_ATENDIDA',
    }),
    ApiUnprocessableEntityResponse({ type: SobreDeError, description: 'Regla de la lectura.' }),
  );
}
