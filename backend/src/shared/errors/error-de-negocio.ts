/** Clasificación de un error de negocio; el filtro global la traduce a estado HTTP. */
export type TipoDeError =
  'NO_ENCONTRADO' | 'CONFLICTO' | 'REGLA_NEGOCIO' | 'NO_AUTORIZADO' | 'PROHIBIDO';

export interface DetalleDeError {
  campo: string;
  mensajes: string[];
}

/**
 * Base de todos los errores de negocio. Cada módulo la extiende en su `errors/businessError.ts`
 * y declara sus códigos de dominio, por ejemplo `FLOTA_MAXIMA_EXCEDIDA`.
 */
export abstract class ErrorDeNegocio extends Error {
  protected constructor(
    readonly codigo: string,
    readonly tipo: TipoDeError,
    mensaje: string,
    readonly detalles: DetalleDeError[] = [],
  ) {
    super(mensaje);
    this.name = new.target.name;
  }
}

/** Entrada que no cumple el contrato del endpoint. No es un error de negocio. */
export class ErrorDeEntrada extends Error {
  readonly codigo = 'ENTRADA_INVALIDA';

  constructor(readonly detalles: DetalleDeError[]) {
    super('La solicitud contiene datos inválidos.');
    this.name = 'ErrorDeEntrada';
  }
}
