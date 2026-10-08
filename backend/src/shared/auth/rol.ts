export const ROLES = ['OPERADOR_ESTACION', 'SUPERVISOR_MUNICIPAL', 'ADMINISTRADOR'] as const;

export type Rol = (typeof ROLES)[number];

export function esRol(valor: string): valor is Rol {
  return (ROLES as readonly string[]).includes(valor);
}
