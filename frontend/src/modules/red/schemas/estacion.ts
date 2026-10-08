import { z } from 'zod';
import {
  esquemaCodigo,
  esquemaEstadoLinea,
  esquemaIdOpcional,
  esquemaMunicipalidadElegida,
  esquemaNombre,
  esquemaNumeroDePagina,
  esquemaPagina,
  esquemaReferencia,
  numeroOpcional,
} from './comunes';

export const esquemaEstacionListado = z.object({
  id: z.number().int().positive(),
  codigo: z.string(),
  nombre: z.string(),
  municipalidad: esquemaReferencia,
  tieneParqueo: z.boolean(),
  lineas: z.array(z.object({ id: z.number().int().positive(), codigo: z.string() })),
  sinLinea: z.boolean(),
});

export type EstacionListado = z.infer<typeof esquemaEstacionListado>;

export const esquemaPaginaEstaciones = esquemaPagina(esquemaEstacionListado);

export type PaginaEstaciones = z.infer<typeof esquemaPaginaEstaciones>;

export const esquemaEstacionDetalle = z.object({
  id: z.number().int().positive(),
  codigo: z.string(),
  nombre: z.string(),
  municipalidad: esquemaReferencia,
  tieneParqueo: z.boolean(),
  latitud: z.number().nullable(),
  longitud: z.number().nullable(),
  lineas: z.array(
    z.object({
      id: z.number().int().positive(),
      codigo: z.string(),
      nombre: z.string(),
      estado: esquemaEstadoLinea,
      posicion: z.number().int().positive(),
    }),
  ),
});

export type EstacionDetalle = z.infer<typeof esquemaEstacionDetalle>;

export const esquemaOpcionEstacion = z.object({
  id: z.number().int().positive(),
  codigo: z.string(),
  nombre: z.string(),
});

export type OpcionEstacion = z.infer<typeof esquemaOpcionEstacion>;

export const esquemaOpcionesEstacion = z.array(esquemaOpcionEstacion);

/** Filtros del listado tal como llegan en la URL; lo que no sirve se ignora. */
export const esquemaFiltrosEstaciones = z.object({
  municipalidadId: esquemaIdOpcional,
  lineaId: esquemaIdOpcional,
  tieneParqueo: z.enum(['true', 'false']).optional().catch(undefined),
  busqueda: z
    .string()
    .trim()
    .max(100)
    .transform((texto) => (texto === '' ? undefined : texto))
    .optional()
    .catch(undefined),
  pagina: esquemaNumeroDePagina,
});

export type FiltrosEstaciones = z.infer<typeof esquemaFiltrosEstaciones>;

const MENSAJE_COORDENADAS = 'Escribe la latitud y la longitud, o deja las dos vacías.';

const latitud = numeroOpcional(
  z
    .number({ error: 'Escribe un número.' })
    .min(-90, 'La latitud va de -90 a 90.')
    .max(90, 'La latitud va de -90 a 90.'),
);

const longitud = numeroOpcional(
  z
    .number({ error: 'Escribe un número.' })
    .min(-180, 'La longitud va de -180 a 180.')
    .max(180, 'La longitud va de -180 a 180.'),
);

type Coordenadas = Readonly<{ latitud?: number; longitud?: number }>;

/** Las coordenadas van las dos o ninguna; el error se marca en la que falta. */
function coordenadasCompletas(datos: Coordenadas, contexto: z.RefinementCtx): void {
  if (datos.latitud !== undefined && datos.longitud === undefined) {
    contexto.addIssue({ code: 'custom', path: ['longitud'], message: MENSAJE_COORDENADAS });
  }
  if (datos.latitud === undefined && datos.longitud !== undefined) {
    contexto.addIssue({ code: 'custom', path: ['latitud'], message: MENSAJE_COORDENADAS });
  }
}

const camposEditables = {
  nombre: esquemaNombre,
  municipalidadId: esquemaMunicipalidadElegida,
  tieneParqueo: z.boolean({ error: 'Indica si tiene parqueo.' }),
  latitud,
  longitud,
};

export const esquemaFormularioEstacion = z
  .object({ codigo: esquemaCodigo, ...camposEditables })
  .superRefine(coordenadasCompletas);

export type FormularioEstacion = z.output<typeof esquemaFormularioEstacion>;

/** Al editar no se cambia el código. */
export const esquemaFormularioEdicionEstacion = z
  .object(camposEditables)
  .superRefine(coordenadasCompletas);

export type FormularioEdicionEstacion = z.output<typeof esquemaFormularioEdicionEstacion>;
