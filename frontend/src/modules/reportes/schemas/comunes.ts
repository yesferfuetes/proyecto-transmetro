import { z } from 'zod';

/** Identificador numérico positivo; acepta el texto de una ruta o de un campo. */
export const esquemaId = z.coerce.number().int().positive();

/** Filtro de identificador en la URL: un valor que no sirve se ignora. */
export const esquemaIdOpcional = esquemaId.optional().catch(undefined);

export const esquemaNumeroDePagina = z.coerce.number().int().positive().catch(1);

export const esquemaCreado = z.object({ id: z.number().int().positive() });

/** Página de resultados con la forma común de los listados del backend. */
export function esquemaPagina<T extends z.ZodType>(
  esquemaElemento: T,
): z.ZodObject<{
  elementos: z.ZodArray<T>;
  total: z.ZodNumber;
  pagina: z.ZodNumber;
  tamano: z.ZodNumber;
}> {
  return z.object({
    elementos: z.array(esquemaElemento),
    total: z.number().int().nonnegative(),
    pagina: z.number().int().positive(),
    tamano: z.number().int().positive(),
  });
}

export const esquemaReferenciaDeLinea = z.object({
  id: z.number().int().positive(),
  codigo: z.string(),
  nombre: z.string(),
});
export type ReferenciaDeLinea = z.infer<typeof esquemaReferenciaDeLinea>;

export const esquemaReferenciaConNombre = z.object({
  id: z.number().int().positive(),
  nombre: z.string(),
});
export type ReferenciaConNombre = z.infer<typeof esquemaReferenciaConNombre>;
