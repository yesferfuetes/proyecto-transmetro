import { z } from 'zod';
import { esquemaPagina, esquemaReferenciaConNombre, esquemaReferenciaDeLinea } from './comunes';
import { esquemaConsulta } from './consulta';

export const esquemaEstadoDeFlota = z.preprocess(
  (valor) => (typeof valor === 'string' ? valor.toLowerCase() : valor),
  z.enum(['completa', 'insuficiente', 'excedida']),
);
export type EstadoDeFlota = z.infer<typeof esquemaEstadoDeFlota>;

export const esquemaEstadoDeBus = z.enum(['ACTIVO', 'MANTENIMIENTO', 'BAJA']);
export type EstadoDeBus = z.infer<typeof esquemaEstadoDeBus>;

export const esquemaFilaDeEstacion = z.object({
  id: z.number().int().positive(),
  codigo: z.string(),
  nombre: z.string(),
  municipalidad: esquemaReferenciaConNombre,
  lineas: z.array(esquemaReferenciaDeLinea),
  tieneParqueo: z.boolean(),
});
export type FilaDeEstacion = z.infer<typeof esquemaFilaDeEstacion>;

export const esquemaFilaDeLinea = z.object({
  id: z.number().int().positive(),
  codigo: z.string(),
  nombre: z.string(),
  municipalidad: esquemaReferenciaConNombre,
  estado: z.string(),
  estaciones: z.number().int().nonnegative(),
  longitudKm: z.number().nonnegative().nullable(),
  buses: z.number().int().nonnegative(),
  minimo: z.number().int().nonnegative(),
  maximo: z.number().int().nonnegative(),
  estadoDeFlota: esquemaEstadoDeFlota,
});
export type FilaDeLinea = z.infer<typeof esquemaFilaDeLinea>;

export const esquemaFilaDeBus = z.object({
  id: z.number().int().positive(),
  placa: z.string(),
  capacidadMax: z.number().int().positive(),
  estado: esquemaEstadoDeBus,
  linea: esquemaReferenciaDeLinea.nullable(),
  parqueo: z.object({
    id: z.number().int().positive(),
    codigo: z.string(),
    estacion: esquemaReferenciaConNombre,
  }),
});
export type FilaDeBus = z.infer<typeof esquemaFilaDeBus>;

export const esquemaGrupoDeBuses = z.object({
  linea: esquemaReferenciaDeLinea.nullable(),
  buses: z.number().int().nonnegative(),
});
export type GrupoDeBuses = z.infer<typeof esquemaGrupoDeBuses>;

export const esquemaReporteDeEstaciones = esquemaPagina(esquemaFilaDeEstacion).extend({
  consulta: esquemaConsulta,
});
export type ReporteDeEstaciones = z.infer<typeof esquemaReporteDeEstaciones>;

export const esquemaReporteDeLineas = esquemaPagina(esquemaFilaDeLinea).extend({
  consulta: esquemaConsulta,
});
export type ReporteDeLineas = z.infer<typeof esquemaReporteDeLineas>;

export const esquemaReporteDeBuses = esquemaPagina(esquemaFilaDeBus).extend({
  consulta: esquemaConsulta,
  grupos: z.array(esquemaGrupoDeBuses),
});
export type ReporteDeBuses = z.infer<typeof esquemaReporteDeBuses>;
