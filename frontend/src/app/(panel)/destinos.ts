import type { Destino } from '@/shared/components/navegacion';

const TODOS = ['operador', 'supervisor', 'administrador'] as const;

export const ETIQUETA_DE_ROL: Record<string, string> = {
  operador: 'Operador de estación',
  supervisor: 'Supervisor municipal',
  administrador: 'Administrador',
};

/**
 * Destinos del área autenticada en el orden de la navegación. Matriz provisional: todos los roles
 * ven todo salvo Usuarios, que es del administrador. La reemplaza la matriz real de permisos.
 */
export const DESTINOS: readonly Destino[] = [
  { href: '/inicio', etiqueta: 'Inicio', icono: 'inicio', roles: TODOS },
  { href: '/alertas', etiqueta: 'Alertas', icono: 'alertas', roles: TODOS },
  { href: '/flota', etiqueta: 'Flota', icono: 'bus', roles: TODOS },
  { href: '/lineas', etiqueta: 'Líneas', icono: 'lineas', roles: TODOS },
  { href: '/estaciones', etiqueta: 'Estaciones', icono: 'estaciones', roles: TODOS },
  { href: '/pilotos', etiqueta: 'Pilotos', icono: 'pilotos', roles: TODOS },
  { href: '/reportes', etiqueta: 'Reportes', icono: 'reportes', roles: TODOS },
  { href: '/usuarios', etiqueta: 'Usuarios', icono: 'usuarios', roles: ['administrador'] },
];

/** Orden de los accesos rápidos de Inicio. */
export const ORDEN_DE_MOSAICOS = [
  '/lineas',
  '/estaciones',
  '/flota',
  '/pilotos',
  '/alertas',
  '/reportes',
  '/usuarios',
] as const;
