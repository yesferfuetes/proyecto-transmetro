import type { Rol } from './rol';

/** Usuario de la sesión tal como está en la base al recibir la solicitud. */
export interface UsuarioSesion {
  id: number;
  nombre: string;
  correo: string;
  rol: Rol;
  estacionId: number | null;
}
