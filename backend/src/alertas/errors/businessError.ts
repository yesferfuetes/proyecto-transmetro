import { ErrorDeNegocio } from '../../shared/errors/error-de-negocio';

/** Base de los errores de negocio del módulo alertas. Cada error concreto declara su código. */
export abstract class AlertasError extends ErrorDeNegocio {}
