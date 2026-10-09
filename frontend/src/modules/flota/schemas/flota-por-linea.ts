import { z } from 'zod';
import { esquemaReferencia } from './comunes';

export const esquemaEstadoDeFlota = z.preprocess(
  (valor) => (typeof valor === 'string' ? valor.toLowerCase() : valor),
  z.enum(['completa', 'insuficiente', 'excedida']),
);
export type EstadoDeFlota = z.infer<typeof esquemaEstadoDeFlota>;

export const esquemaFlotaDeLinea = z.object({
  linea: esquemaReferencia.extend({ id: z.number().int().positive(), estado: z.string() }),
  estaciones: z.number().int().nonnegative(),
  minimo: z.number().int().nonnegative(),
  maximo: z.number().int().nonnegative(),
  buses: z.number().int().nonnegative(),
  estadoDeFlota: esquemaEstadoDeFlota,
});
export type FlotaDeLinea = z.infer<typeof esquemaFlotaDeLinea>;

export const esquemaFlotaPorLinea = z.array(esquemaFlotaDeLinea);
