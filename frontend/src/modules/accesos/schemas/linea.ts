import { z } from 'zod';
import { esquemaPagina } from './comunes';

/** De cada línea solo se necesita cómo identificarla en un filtro o un enlace. */
export const esquemaOpcionDeLinea = z.object({
  id: z.number().int().positive(),
  codigo: z.string(),
  nombre: z.string(),
});

export type OpcionDeLinea = z.infer<typeof esquemaOpcionDeLinea>;

export const esquemaPaginaDeLineas = esquemaPagina(esquemaOpcionDeLinea);
