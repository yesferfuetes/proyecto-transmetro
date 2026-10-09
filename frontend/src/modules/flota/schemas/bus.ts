import { z } from 'zod';
import {
  cantidadEntera,
  elegido,
  esquemaIdOpcional,
  esquemaNumeroDePagina,
  esquemaPagina,
  esquemaReferencia,
} from './comunes';

export const esquemaEstadoDeBus = z.enum(['ACTIVO', 'MANTENIMIENTO', 'BAJA'], {
  error: 'Elige un estado.',
});
export type EstadoDeBus = z.infer<typeof esquemaEstadoDeBus>;

export const ETIQUETA_DE_ESTADO_DE_BUS: Readonly<Record<EstadoDeBus, string>> = {
  ACTIVO: 'Activo',
  MANTENIMIENTO: 'En mantenimiento',
  BAJA: 'De baja',
};

export const esquemaBus = z.object({
  id: z.number().int().positive(),
  placa: z.string(),
  capacidadMax: z.number().int().positive(),
  estado: esquemaEstadoDeBus,
  linea: esquemaReferencia.nullable(),
  parqueo: z.object({
    id: z.number().int().positive(),
    codigo: z.string(),
    estacion: z.object({ id: z.number().int().positive(), nombre: z.string() }),
  }),
});
export type Bus = z.infer<typeof esquemaBus>;

export const esquemaPaginaBuses = esquemaPagina(esquemaBus);
export type PaginaBuses = z.infer<typeof esquemaPaginaBuses>;

/** Filtros del listado tal como llegan en la URL; lo que no sirve se ignora. */
export const esquemaFiltrosBuses = z.object({
  lineaId: esquemaIdOpcional,
  sinLinea: z.literal('1').optional().catch(undefined),
  estado: esquemaEstadoDeBus.optional().catch(undefined),
  parqueoId: esquemaIdOpcional,
  busqueda: z
    .string()
    .trim()
    .max(15)
    .transform((texto) => (texto === '' ? undefined : texto))
    .optional()
    .catch(undefined),
  pagina: esquemaNumeroDePagina,
});
export type FiltrosBuses = z.infer<typeof esquemaFiltrosBuses>;

/** Línea elegida en una lista: el valor vacío significa "sin línea". */
const esquemaLineaOpcional = z.preprocess(
  (valor) => (valor === '' || valor === null || valor === undefined ? null : Number(valor)),
  z
    .number({ error: 'Elige una línea.' })
    .int('Elige una línea.')
    .positive('Elige una línea.')
    .nullable(),
);

export const esquemaFormularioBus = z.object({
  placa: z
    .string({ error: 'Escribe la placa.' })
    .trim()
    .min(1, 'Escribe la placa.')
    .max(15, 'Usa como máximo 15 caracteres.'),
  capacidadMax: cantidadEntera('Escribe la capacidad como un número entero.'),
  parqueoId: elegido('Elige un parqueo.'),
  lineaId: esquemaLineaOpcional,
});
export type FormularioBus = z.output<typeof esquemaFormularioBus>;

export const esquemaEdicionDeBus = esquemaFormularioBus.pick({ capacidadMax: true });
export type EdicionDeBus = z.output<typeof esquemaEdicionDeBus>;

export const esquemaCambioDeLinea = z.object({ lineaId: esquemaLineaOpcional });
export type CambioDeLinea = z.output<typeof esquemaCambioDeLinea>;

export const esquemaCambioDeParqueo = z.object({ parqueoId: elegido('Elige un parqueo.') });
export type CambioDeParqueo = z.output<typeof esquemaCambioDeParqueo>;

export const esquemaCambioDeEstado = z.object({ estado: esquemaEstadoDeBus });
export type CambioDeEstado = z.output<typeof esquemaCambioDeEstado>;
