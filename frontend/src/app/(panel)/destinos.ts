import type { Destino } from '@/shared/components/navegacion';
import type { Rol } from '@/shared/schemas/sesion';

const TODOS: readonly Rol[] = ['OPERADOR_ESTACION', 'SUPERVISOR_MUNICIPAL', 'ADMINISTRADOR'];

/**
 * Destinos del área autenticada en el orden de la navegación. Menú y mosaicos salen de esta misma
 * lista. Cada módulo agrega su destino cuando se integra.
 */
export const DESTINOS: readonly Destino[] = [
  { href: '/inicio', etiqueta: 'Inicio', icono: 'inicio', roles: TODOS },
  { href: '/lineas', etiqueta: 'Líneas', icono: 'lineas', roles: TODOS },
  { href: '/estaciones', etiqueta: 'Estaciones', icono: 'estaciones', roles: TODOS },
  { href: '/municipalidades', etiqueta: 'Municipalidades', icono: 'municipalidad', roles: TODOS },
  { href: '/accesos', etiqueta: 'Accesos', icono: 'accesos', roles: TODOS },
  { href: '/flota', etiqueta: 'Flota', icono: 'bus', roles: TODOS },
  { href: '/usuarios', etiqueta: 'Usuarios', icono: 'usuarios', roles: ['ADMINISTRADOR'] },
];

/** Orden de los accesos rápidos de Inicio. */
export const ORDEN_DE_MOSAICOS = [
  '/lineas',
  '/estaciones',
  '/municipalidades',
  '/accesos',
  '/flota',
  '/usuarios',
] as const;
