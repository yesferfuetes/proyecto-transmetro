import { z } from 'zod';
import {
  esquemaBusqueda,
  esquemaNumeroDePagina,
  esquemaPagina,
  esquemaTextoONulo,
} from './comunes';
import { esquemaReferenciaDeEstacion } from './acceso';

const esquemaIdPositivo = z.number().int().positive();

export const esquemaGuardiaListado = z.object({
  id: esquemaIdPositivo,
  nombre: z.string(),
  dpi: z.string(),
  telefono: esquemaTextoONulo,
  asignaciones: z.number().int().nonnegative(),
  sinAsignacion: z.boolean(),
});

export type GuardiaListado = z.infer<typeof esquemaGuardiaListado>;

export const esquemaPaginaGuardias = esquemaPagina(esquemaGuardiaListado);

export type PaginaGuardias = z.infer<typeof esquemaPaginaGuardias>;

export const esquemaGuardiaDetalle = z.object({
  id: esquemaIdPositivo,
  nombre: z.string(),
  dpi: z.string(),
  telefono: esquemaTextoONulo,
  asignaciones: z.array(
    z.object({
      acceso: z.object({ id: esquemaIdPositivo, codigo: z.string() }),
      estacion: esquemaReferenciaDeEstacion,
      turno: z.string(),
    }),
  ),
});

export type GuardiaDetalle = z.infer<typeof esquemaGuardiaDetalle>;

export const esquemaOpcionesDeGuardia = z.array(
  z.object({ id: esquemaIdPositivo, nombre: z.string(), dpi: z.string() }),
);

export type OpcionDeGuardia = z.infer<typeof esquemaOpcionesDeGuardia>[number];

export const esquemaFiltrosGuardias = z.object({
  busqueda: esquemaBusqueda,
  pagina: esquemaNumeroDePagina,
});

export type FiltrosGuardias = z.infer<typeof esquemaFiltrosGuardias>;

/** Cortesía de forma: 13 dígitos, con espacios entre grupos si se quiere. */
const esquemaDpi = z
  .string({ error: 'Escribe el DPI.' })
  .trim()
  .min(1, 'Escribe el DPI.')
  .refine((texto) => /^\d{13}$/.test(texto.replace(/\s/g, '')), 'El DPI tiene 13 dígitos.');

const telefonoOpcional = z.preprocess(
  (valor) => (typeof valor === 'string' && valor.trim() === '' ? undefined : valor),
  z
    .string()
    .trim()
    .refine((texto) => /^\d{4}-?\d{4}$/.test(texto), 'El teléfono tiene 8 dígitos.')
    .optional(),
);

export const esquemaFormularioGuardia = z.object({
  nombre: z
    .string({ error: 'Escribe el nombre.' })
    .trim()
    .min(1, 'Escribe el nombre.')
    .max(150, 'Usa como máximo 150 caracteres.'),
  dpi: esquemaDpi,
  telefono: telefonoOpcional,
});

export type FormularioGuardia = z.output<typeof esquemaFormularioGuardia>;
