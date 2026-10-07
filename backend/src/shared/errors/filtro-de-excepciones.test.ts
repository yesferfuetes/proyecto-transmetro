import { ArgumentsHost, HttpStatus, NotFoundException, Logger } from '@nestjs/common';
import { ErrorDeEntrada, ErrorDeNegocio, TipoDeError } from './error-de-negocio';
import { FiltroDeExcepciones } from './filtro-de-excepciones';

class ErrorDePrueba extends ErrorDeNegocio {
  constructor(tipo: TipoDeError) {
    super('CODIGO_DE_PRUEBA', tipo, 'Mensaje de prueba.');
  }
}

describe('FiltroDeExcepciones', () => {
  const filtro = new FiltroDeExcepciones();

  it.each<[TipoDeError, number]>([
    ['NO_ENCONTRADO', HttpStatus.NOT_FOUND],
    ['CONFLICTO', HttpStatus.CONFLICT],
    ['REGLA_NEGOCIO', HttpStatus.UNPROCESSABLE_ENTITY],
    ['NO_AUTORIZADO', HttpStatus.UNAUTHORIZED],
    ['PROHIBIDO', HttpStatus.FORBIDDEN],
  ])('traduce un error de negocio %s al estado %i con su código', (tipo, estado) => {
    expect(filtro.traducir(new ErrorDePrueba(tipo))).toEqual({
      estado,
      cuerpo: { codigo: 'CODIGO_DE_PRUEBA', mensaje: 'Mensaje de prueba.', detalles: [] },
    });
  });

  it('traduce una entrada inválida a 400 con el detalle por campo', () => {
    const detalles = [{ campo: 'placa', mensajes: ['placa must be a string'] }];
    expect(filtro.traducir(new ErrorDeEntrada(detalles))).toEqual({
      estado: HttpStatus.BAD_REQUEST,
      cuerpo: {
        codigo: 'ENTRADA_INVALIDA',
        mensaje: 'La solicitud contiene datos inválidos.',
        detalles,
      },
    });
  });

  it('conserva el estado de una excepción HTTP del framework', () => {
    const { estado, cuerpo } = filtro.traducir(new NotFoundException('Cannot GET /x'));
    expect(estado).toBe(HttpStatus.NOT_FOUND);
    expect(cuerpo.codigo).toBe('RECURSO_NO_ENCONTRADO');
  });

  it('responde 500 sin detalles internos ante un error no controlado', () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const { estado, cuerpo } = filtro.traducir(new Error('conexión rechazada en 10.0.0.5'));
    expect(estado).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(cuerpo).toEqual({
      codigo: 'ERROR_INTERNO',
      mensaje: 'Ocurrió un error inesperado.',
      detalles: [],
    });
  });

  it('escribe el estado y el sobre en la respuesta HTTP', () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    const host = {
      switchToHttp: () => ({ getResponse: () => ({ status }) }),
    } as unknown as ArgumentsHost;

    filtro.catch(new ErrorDePrueba('CONFLICTO'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ codigo: 'CODIGO_DE_PRUEBA' }));
  });
});
