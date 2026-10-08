import type { Rol } from '../../../shared/auth/rol';

export interface EstacionAsignable {
  id: number;
  codigo: string;
  nombre: string;
}

export interface MiCuenta {
  id: number;
  nombre: string;
  correo: string;
  rol: Rol;
  estacion: EstacionAsignable | null;
}

export interface UsuarioListado {
  id: number;
  nombre: string;
  correo: string;
  rol: Rol;
  estacion: EstacionAsignable | null;
  activo: boolean;
}

export interface PaginaDeUsuarios {
  elementos: UsuarioListado[];
  total: number;
  pagina: number;
  tamano: number;
}

export interface UsuarioDetalle {
  id: number;
  nombre: string;
  correo: string;
  rol: Rol;
  estacionId: number | null;
  activo: boolean;
  creadoEn: Date;
}
