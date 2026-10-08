import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { SobreDeError } from '../../shared/errors/sobre-de-error';

/** Respuestas de toda ruta con sesión: sin sesión o vencida (401) y rol sin permiso (403). */
export function RespuestasDeSesion(): MethodDecorator & ClassDecorator {
  return applyDecorators(
    ApiUnauthorizedResponse({
      type: SobreDeError,
      description: 'NO_AUTENTICADO o SESION_EXPIRADA.',
    }),
    ApiForbiddenResponse({ type: SobreDeError, description: 'ACCESO_DENEGADO.' }),
  );
}

export function RespuestaEntradaInvalida(): MethodDecorator {
  return ApiBadRequestResponse({ type: SobreDeError, description: 'ENTRADA_INVALIDA.' });
}

export function RespuestaUsuarioNoExiste(): MethodDecorator {
  return ApiNotFoundResponse({ type: SobreDeError, description: 'USUARIO_NO_EXISTE.' });
}

export function RespuestaReglaDeNegocio(codigos: string): MethodDecorator {
  return ApiUnprocessableEntityResponse({ type: SobreDeError, description: codigos });
}

export function RespuestaCorreoDuplicado(): MethodDecorator {
  return ApiConflictResponse({ type: SobreDeError, description: 'EMAIL_DUPLICADO.' });
}
