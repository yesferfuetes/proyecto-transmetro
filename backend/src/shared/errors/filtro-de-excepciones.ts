import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { ErrorDeEntrada, ErrorDeNegocio, TipoDeError } from './error-de-negocio';
import type { SobreDeError } from './sobre-de-error';

export interface RespuestaDeError {
  estado: number;
  cuerpo: SobreDeError;
}

const ESTADO_POR_TIPO: Record<TipoDeError, HttpStatus> = {
  NO_ENCONTRADO: HttpStatus.NOT_FOUND,
  CONFLICTO: HttpStatus.CONFLICT,
  REGLA_NEGOCIO: HttpStatus.UNPROCESSABLE_ENTITY,
  NO_AUTORIZADO: HttpStatus.UNAUTHORIZED,
  PROHIBIDO: HttpStatus.FORBIDDEN,
};

const CODIGO_POR_ESTADO: Partial<Record<number, string>> = {
  [HttpStatus.BAD_REQUEST]: 'SOLICITUD_INVALIDA',
  [HttpStatus.UNAUTHORIZED]: 'NO_AUTORIZADO',
  [HttpStatus.FORBIDDEN]: 'PROHIBIDO',
  [HttpStatus.NOT_FOUND]: 'RECURSO_NO_ENCONTRADO',
  [HttpStatus.PAYLOAD_TOO_LARGE]: 'SOLICITUD_DEMASIADO_GRANDE',
  [HttpStatus.SERVICE_UNAVAILABLE]: 'SERVICIO_NO_DISPONIBLE',
};

const MENSAJE_INTERNO = 'Ocurrió un error inesperado.';

/** Traduce cualquier excepción al sobre de error común. Nunca expone detalles internos. */
@Catch()
export class FiltroDeExcepciones implements ExceptionFilter {
  private readonly registro = new Logger(FiltroDeExcepciones.name);

  catch(excepcion: unknown, host: ArgumentsHost): void {
    const { estado, cuerpo } = this.traducir(excepcion);
    host.switchToHttp().getResponse<Response>().status(estado).json(cuerpo);
  }

  traducir(excepcion: unknown): RespuestaDeError {
    if (excepcion instanceof ErrorDeNegocio) {
      return {
        estado: ESTADO_POR_TIPO[excepcion.tipo],
        cuerpo: sobre(excepcion.codigo, excepcion.message, excepcion.detalles),
      };
    }
    if (excepcion instanceof ErrorDeEntrada) {
      return {
        estado: HttpStatus.BAD_REQUEST,
        cuerpo: sobre(excepcion.codigo, excepcion.message, excepcion.detalles),
      };
    }
    if (excepcion instanceof HttpException) {
      const estado = excepcion.getStatus();
      const codigo = CODIGO_POR_ESTADO[estado] ?? `HTTP_${estado}`;
      return { estado, cuerpo: sobre(codigo, excepcion.message) };
    }
    this.registro.error(
      excepcion instanceof Error ? (excepcion.stack ?? excepcion.message) : excepcion,
    );
    return {
      estado: HttpStatus.INTERNAL_SERVER_ERROR,
      cuerpo: sobre('ERROR_INTERNO', MENSAJE_INTERNO),
    };
  }
}

function sobre(
  codigo: string,
  mensaje: string,
  detalles: SobreDeError['detalles'] = [],
): SobreDeError {
  return { codigo, mensaje, detalles };
}
