import { ErrorDeNegocio } from '../../shared/errors/error-de-negocio';

/** Base de los errores de negocio del módulo red. Cada error concreto declara su código. */
export abstract class RedError extends ErrorDeNegocio {}
