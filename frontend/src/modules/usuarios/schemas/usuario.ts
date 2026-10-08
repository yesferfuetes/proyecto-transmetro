import { z } from 'zod';
import { esquemaRol } from '@/shared/schemas/sesion';

export const TAMANO_DE_PAGINA = 25;

const esquemaId = z.number().int().positive();

export const esquemaEstacionAsignable = z.object({
  id: esquemaId,
  codigo: z.string(),
  nombre: z.string(),
});
export type EstacionAsignable = z.infer<typeof esquemaEstacionAsignable>;

// Los objetos de Zod descartan las propiedades que no declaran: si el backend enviara de más
// (por ejemplo, el hash de la contraseña), no llega a la vista.
export const esquemaUsuarioListado = z.object({
  id: esquemaId,
  nombre: z.string(),
  correo: z.string(),
  rol: esquemaRol,
  estacion: esquemaEstacionAsignable.nullable(),
  activo: z.boolean(),
});
export type UsuarioListado = z.infer<typeof esquemaUsuarioListado>;

export const esquemaPaginaUsuarios = z.object({
  elementos: z.array(esquemaUsuarioListado),
  total: z.number().int().nonnegative(),
  pagina: z.number().int().positive(),
  tamano: z.number().int().positive(),
});
export type PaginaUsuarios = z.infer<typeof esquemaPaginaUsuarios>;

export const esquemaUsuarioDetalle = z.object({
  id: esquemaId,
  nombre: z.string(),
  correo: z.string(),
  rol: esquemaRol,
  estacionId: esquemaId.nullable(),
  activo: z.boolean(),
  creadoEn: z.iso.datetime({ offset: true }),
});
export type UsuarioDetalle = z.infer<typeof esquemaUsuarioDetalle>;

export const esquemaRegistroCreado = z.object({ id: esquemaId });

/** Identificador de usuario que llega de la URL o de una acción. */
export const esquemaIdUsuario = z.coerce.number().int().positive();

// Un parámetro de búsqueda puede repetirse; se usa el primero.
function primero(valor: unknown): unknown {
  return Array.isArray(valor) ? (valor[0] as unknown) : valor;
}

function parametro<T extends z.ZodType>(esquema: T): z.ZodType<z.output<T> | undefined> {
  return z.transform(primero).pipe(esquema.optional().catch(undefined));
}

/** Filtros del listado tal como llegan en la URL. Un valor que no se entiende se ignora. */
export const esquemaFiltrosUsuarios = z.object({
  rol: parametro(esquemaRol),
  estacionId: parametro(z.coerce.number().int().positive()),
  activo: parametro(z.enum(['true', 'false'])),
  busqueda: parametro(z.string().trim().min(1).max(150)),
  pagina: z.transform(primero).pipe(z.coerce.number().int().positive().catch(1)),
});
export type FiltrosUsuarios = z.infer<typeof esquemaFiltrosUsuarios>;
