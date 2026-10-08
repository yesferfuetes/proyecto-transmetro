import {
  createParamDecorator,
  CustomDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import type { Rol } from './rol';
import type { UsuarioSesion } from './usuario-sesion';

export const METADATO_PUBLICO = 'es-publico';
export const METADATO_ROLES = 'roles';

/** El endpoint no exige sesión. Todo lo demás la exige. */
export function Publico(): CustomDecorator<string> {
  return SetMetadata(METADATO_PUBLICO, true);
}

/** Roles que pueden usar el endpoint, además de tener sesión. */
export function Roles(...roles: Rol[]): CustomDecorator<string> {
  return SetMetadata(METADATO_ROLES, roles);
}

/** Solicitud después de que el guard de sesión deja en ella al usuario vigente. */
export interface SolicitudConSesion {
  usuario?: UsuarioSesion;
}

export function leerUsuarioActual(contexto: ExecutionContext): UsuarioSesion | undefined {
  return contexto.switchToHttp().getRequest<SolicitudConSesion>().usuario;
}

/** Usuario de la sesión, que el guard dejó en la solicitud. */
export const UsuarioActual = createParamDecorator(
  (_datos: unknown, contexto: ExecutionContext): UsuarioSesion | undefined =>
    leerUsuarioActual(contexto),
);
