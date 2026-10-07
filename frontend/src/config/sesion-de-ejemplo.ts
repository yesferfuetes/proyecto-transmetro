import 'server-only';
import { z } from 'zod';

export const ROLES_DE_EJEMPLO = ['operador', 'supervisor', 'administrador'] as const;
export type RolDeEjemplo = (typeof ROLES_DE_EJEMPLO)[number];

const ROL_POR_DEFECTO: RolDeEjemplo = 'supervisor';

const esquema = z.object({
  NODE_ENV: z.string().optional(),
  ROL_DE_EJEMPLO: z.enum(ROLES_DE_EJEMPLO).optional(),
});

/**
 * Rol de la sesión de ejemplo mientras no existe el inicio de sesión. Fuera de producción se puede
 * elegir con ROL_DE_EJEMPLO; en producción, o con un valor inválido, es siempre el supervisor.
 */
export function leerRolDeEjemplo(
  variables: Record<string, string | undefined> = process.env,
): RolDeEjemplo {
  const resultado = esquema.safeParse(variables);
  if (!resultado.success || resultado.data.NODE_ENV === 'production') {
    return ROL_POR_DEFECTO;
  }
  return resultado.data.ROL_DE_EJEMPLO ?? ROL_POR_DEFECTO;
}
