import { z } from 'zod';
import { esquemaParqueo } from './parqueo';

export const esquemaOpcionDeLinea = z.object({
  id: z.number().int().positive(),
  codigo: z.string(),
  nombre: z.string(),
  numeroDeEstaciones: z.number().int().nonnegative(),
  buses: z.number().int().nonnegative(),
  maximo: z.number().int().nonnegative(),
});
export type OpcionDeLinea = z.infer<typeof esquemaOpcionDeLinea>;

/** Parqueos con cupo: tienen la misma forma que en el listado. */
export const esquemaOpcionDeParqueo = esquemaParqueo;

export const esquemaOpcionDeEstacion = z.object({
  id: z.number().int().positive(),
  codigo: z.string(),
  nombre: z.string(),
  /** Si el backend ya filtra, todas llegan con parqueo. */
  tieneParqueo: z.boolean().default(true),
});
export type OpcionDeEstacion = z.infer<typeof esquemaOpcionDeEstacion>;

export const esquemaOpcionesDeLinea = z.array(esquemaOpcionDeLinea);
export const esquemaOpcionesDeParqueo = z.array(esquemaOpcionDeParqueo);
export const esquemaOpcionesDeEstacion = z.array(esquemaOpcionDeEstacion);
