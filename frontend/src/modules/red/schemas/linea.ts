import { z } from 'zod';
import {
  esquemaCodigo,
  esquemaEstadoLinea,
  esquemaIdOpcional,
  esquemaKm,
  esquemaMunicipalidadElegida,
  esquemaNombre,
  esquemaNumeroDePagina,
  esquemaPagina,
  esquemaReferencia,
} from './comunes';

export const esquemaLineaListado = z.object({
  id: z.number().int().positive(),
  codigo: z.string(),
  nombre: z.string(),
  municipalidad: esquemaReferencia,
  estado: esquemaEstadoLinea,
  numeroDeEstaciones: z.number().int().nonnegative(),
  longitudKm: esquemaKm.nullable(),
});

export type LineaListado = z.infer<typeof esquemaLineaListado>;

export const esquemaPaginaLineas = esquemaPagina(esquemaLineaListado);

export type PaginaLineas = z.infer<typeof esquemaPaginaLineas>;

export const esquemaParadaDeRecorrido = z.object({
  posicion: z.number().int().positive(),
  estacion: z.object({
    id: z.number().int().positive(),
    codigo: z.string(),
    nombre: z.string(),
    municipalidadNombre: z.string(),
  }),
  distanciaSiguienteKm: esquemaKm.nullable(),
  distanciaAcumuladaKm: esquemaKm,
});

export type ParadaDeRecorrido = z.infer<typeof esquemaParadaDeRecorrido>;

export const esquemaLineaDetalle = z.object({
  id: z.number().int().positive(),
  codigo: z.string(),
  nombre: z.string(),
  municipalidad: esquemaReferencia,
  estado: esquemaEstadoLinea,
  longitudKm: esquemaKm.nullable(),
  creadoEn: z.string(),
  recorrido: z.array(esquemaParadaDeRecorrido),
});

export type LineaDetalle = z.infer<typeof esquemaLineaDetalle>;

/** Filtros del listado tal como llegan en la URL; lo que no sirve se ignora. */
export const esquemaFiltrosLineas = z.object({
  municipalidadId: esquemaIdOpcional,
  estado: esquemaEstadoLinea.optional().catch(undefined),
  pagina: esquemaNumeroDePagina,
});

export type FiltrosLineas = z.infer<typeof esquemaFiltrosLineas>;

export const esquemaFormularioLinea = z.object({
  codigo: esquemaCodigo,
  nombre: esquemaNombre,
  municipalidadId: esquemaMunicipalidadElegida,
  estado: esquemaEstadoLinea,
});

export type FormularioLinea = z.output<typeof esquemaFormularioLinea>;

/** Al editar no se cambian el código ni el estado. */
export const esquemaFormularioEdicionLinea = esquemaFormularioLinea.pick({
  nombre: true,
  municipalidadId: true,
});

export type FormularioEdicionLinea = z.output<typeof esquemaFormularioEdicionLinea>;

export const esquemaCambioDeEstado = z.object({ estado: esquemaEstadoLinea });

export type CambioDeEstado = z.output<typeof esquemaCambioDeEstado>;
