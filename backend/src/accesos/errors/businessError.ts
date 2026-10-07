import { ErrorDeNegocio } from '../../shared/errors/error-de-negocio';

/** Base de los errores de negocio del módulo accesos. Cada error concreto declara su código. */
export abstract class AccesosError extends ErrorDeNegocio {}
