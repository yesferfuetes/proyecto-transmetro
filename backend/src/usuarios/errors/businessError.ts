import { ErrorDeNegocio } from '../../shared/errors/error-de-negocio';

/** Base de los errores de negocio del módulo usuarios. Cada error concreto declara su código. */
export abstract class UsuariosError extends ErrorDeNegocio {}
