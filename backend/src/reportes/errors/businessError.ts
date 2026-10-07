import { ErrorDeNegocio } from '../../shared/errors/error-de-negocio';

/** Base de los errores de negocio del módulo reportes. Cada error concreto declara su código. */
export abstract class ReportesError extends ErrorDeNegocio {}
