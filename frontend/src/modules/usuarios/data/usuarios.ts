import 'server-only';
import { z } from 'zod';
import { solicitarConSesion, type MetodoHttp } from '@/shared/lib/http/cliente-backend';
import type { Resultado } from '@/shared/lib/http/resultado';
import type { Rol } from '@/shared/schemas/sesion';
import {
  esquemaEstacionAsignable,
  esquemaPaginaUsuarios,
  esquemaRegistroCreado,
  esquemaUsuarioDetalle,
  TAMANO_DE_PAGINA,
  type EstacionAsignable,
  type FiltrosUsuarios,
  type PaginaUsuarios,
  type UsuarioDetalle,
} from '../schemas/usuario';

const TIEMPO_DE_ESPERA_MS = 5000;

const sinCuerpo = z.undefined();

function consultar<T>(ruta: string, esquema: z.ZodType<T>): Promise<Resultado<T>> {
  return solicitarConSesion({ ruta, esquema, tiempoEsperaMs: TIEMPO_DE_ESPERA_MS });
}

function modificar<T>(
  metodo: MetodoHttp,
  ruta: string,
  esquema: z.ZodType<T>,
  cuerpo?: unknown,
): Promise<Resultado<T>> {
  return solicitarConSesion({ ruta, metodo, cuerpo, esquema, tiempoEsperaMs: TIEMPO_DE_ESPERA_MS });
}

function parametrosDelListado(filtros: FiltrosUsuarios): URLSearchParams {
  const parametros = new URLSearchParams();
  const valores: Record<string, string | number | undefined> = {
    rol: filtros.rol,
    estacionId: filtros.estacionId,
    activo: filtros.activo,
    busqueda: filtros.busqueda,
  };
  for (const [clave, valor] of Object.entries(valores)) {
    if (valor !== undefined) {
      parametros.set(clave, String(valor));
    }
  }
  parametros.set('pagina', String(filtros.pagina));
  parametros.set('tamano', String(TAMANO_DE_PAGINA));
  return parametros;
}

export function listarUsuarios(filtros: FiltrosUsuarios): Promise<Resultado<PaginaUsuarios>> {
  return consultar(`/usuarios?${parametrosDelListado(filtros).toString()}`, esquemaPaginaUsuarios);
}

export function obtenerUsuario(id: number): Promise<Resultado<UsuarioDetalle>> {
  return consultar(`/usuarios/${id}`, esquemaUsuarioDetalle);
}

export function listarEstacionesAsignables(): Promise<Resultado<EstacionAsignable[]>> {
  return consultar('/usuarios/estaciones-asignables', z.array(esquemaEstacionAsignable));
}

export type DatosDeRegistro = Readonly<{
  nombre: string;
  correo: string;
  rol: Rol;
  contrasena: string;
  estacionId?: number;
}>;

export function registrarUsuarioEnBackend(
  datos: DatosDeRegistro,
): Promise<Resultado<{ id: number }>> {
  return modificar('POST', '/usuarios', esquemaRegistroCreado, datos);
}

export type DatosDeEdicion = Readonly<{
  nombre: string;
  correo: string;
  rol: Rol;
  /** `null` retira la estación. */
  estacionId: number | null;
}>;

export function editarUsuarioEnBackend(
  id: number,
  datos: DatosDeEdicion,
): Promise<Resultado<undefined>> {
  return modificar('PATCH', `/usuarios/${id}`, sinCuerpo, datos);
}

export function desactivarUsuarioEnBackend(id: number): Promise<Resultado<undefined>> {
  return modificar('POST', `/usuarios/${id}/desactivacion`, sinCuerpo);
}

export function reactivarUsuarioEnBackend(id: number): Promise<Resultado<undefined>> {
  return modificar('POST', `/usuarios/${id}/reactivacion`, sinCuerpo);
}

export function asignarContrasenaEnBackend(
  id: number,
  contrasena: string,
): Promise<Resultado<undefined>> {
  return modificar('PUT', `/usuarios/${id}/contrasena`, sinCuerpo, { contrasena });
}

export function cambiarMiContrasenaEnBackend(
  datos: Readonly<{ contrasenaActual: string; contrasenaNueva: string }>,
): Promise<Resultado<undefined>> {
  return modificar('PUT', '/usuarios/yo/contrasena', sinCuerpo, datos);
}
