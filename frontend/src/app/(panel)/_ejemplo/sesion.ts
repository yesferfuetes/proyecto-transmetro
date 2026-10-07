import 'server-only';
import { leerRolDeEjemplo, type RolDeEjemplo } from '@/config/sesion-de-ejemplo';

export type SesionDeEjemplo = Readonly<{ nombre: string; rol: RolDeEjemplo; estacion?: string }>;

const NOMBRES: Record<RolDeEjemplo, SesionDeEjemplo> = {
  operador: { nombre: 'Operador de ejemplo', rol: 'operador', estacion: 'Estación El Trébol' },
  supervisor: { nombre: 'Supervisor de ejemplo', rol: 'supervisor' },
  administrador: { nombre: 'Administrador de ejemplo', rol: 'administrador' },
};

/** Sesión fija hasta que exista el inicio de sesión; se lee en el servidor como la real. */
export function obtenerSesionDeEjemplo(): Promise<SesionDeEjemplo> {
  return Promise.resolve(NOMBRES[leerRolDeEjemplo()]);
}
