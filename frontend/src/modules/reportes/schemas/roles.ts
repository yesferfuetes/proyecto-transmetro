import type { Rol } from '@/shared/schemas/sesion';

/** Quién puede generar reportes, exportarlos y consultar la bitácora. */
export const ROLES_DE_REPORTES: readonly Rol[] = ['SUPERVISOR_MUNICIPAL', 'ADMINISTRADOR'];
