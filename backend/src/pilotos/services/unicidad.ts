import { QueryFailedError } from 'typeorm';

const VIOLACION_DE_UNICIDAD = '23505';

/** La base rechazó la escritura por una restricción UNIQUE (dos registros simultáneos). */
export function esViolacionDeUnicidad(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }
  const origen = error.driverError as { code?: string } | undefined;
  return origen?.code === VIOLACION_DE_UNICIDAD;
}
