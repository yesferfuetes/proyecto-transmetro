/**
 * Usuarios de la demo. El dominio .test está reservado: no son correos reales. La contraseña no
 * se escribe en el repositorio; llega por la variable SEED_CONTRASENA.
 */

export interface DatosUsuario {
  nombre: string;
  email: string;
  rol: 'OPERADOR_ESTACION' | 'SUPERVISOR_MUNICIPAL' | 'ADMINISTRADOR';
}

export const USUARIOS_SIN_ESTACION: readonly DatosUsuario[] = [
  { nombre: 'Administrador de la demo', email: 'admin@transmetro.test', rol: 'ADMINISTRADOR' },
  {
    nombre: 'Supervisor de la demo',
    email: 'supervisor@transmetro.test',
    rol: 'SUPERVISOR_MUNICIPAL',
  },
];

/** Líneas cuya primera estación recibe un operador; si dos comparten estación, hay uno solo. */
export const LINEAS_CON_OPERADOR: readonly string[] = ['L1', 'L2', 'L12'];

export const DOMINIO_DE_LA_DEMO = 'transmetro.test';
