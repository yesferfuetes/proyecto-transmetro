import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { SobreDeError } from '../../shared/errors/sobre-de-error';

/** Respuestas de error comunes a los endpoints de reportes. */
export function ErroresDeReportes(): MethodDecorator & ClassDecorator {
  return applyDecorators(
    ApiBadRequestResponse({ type: SobreDeError, description: 'ENTRADA_INVALIDA' }),
    ApiForbiddenResponse({ type: SobreDeError, description: 'ACCESO_DENEGADO' }),
    ApiUnprocessableEntityResponse({
      type: SobreDeError,
      description:
        'TIPO_DE_REPORTE_INVALIDO, LINEA_NO_EXISTE, ESTACION_NO_EXISTE, MUNICIPALIDAD_NO_EXISTE, ' +
        'RANGO_DE_FECHAS_INVALIDO o CONSTANCIA_NO_REGISTRADA.',
    }),
  );
}

export function ConsultaAjena(): MethodDecorator & ClassDecorator {
  return ApiNotFoundResponse({
    type: SobreDeError,
    description: 'CONSULTA_NO_EXISTE: no existe o es de otro usuario.',
  });
}
