import { z } from 'zod';

/** Identificador numérico positivo; acepta el texto de una ruta o de un campo. */
export const esquemaId = z.coerce.number().int().positive();

/** Filtro de identificador en la URL: un valor que no sirve se ignora. */
export const esquemaIdOpcional = esquemaId.optional().catch(undefined);

export const esquemaNumeroDePagina = z.coerce.number().int().positive().catch(1);

export const esquemaCreado = z.object({ id: z.number().int().positive() });

/** Respuesta vacía de las escrituras que no devuelven nada. */
export const esquemaSinContenido = z.undefined();

/** Texto que el backend entrega como cadena o nulo; ausente cuenta como nulo. */
export const esquemaTextoONulo = z
  .string()
  .nullish()
  .transform((texto) => texto ?? null);

/** Búsqueda en la URL: sin espacios a los lados; vacía o inválida cuenta como no escrita. */
export const esquemaBusqueda = z
  .string()
  .trim()
  .max(100)
  .transform((texto) => (texto === '' ? undefined : texto))
  .optional()
  .catch(undefined);

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

/** Texto de un campo: sin espacios a los lados; vacío cuenta como no escrito. */
export function textoOpcional(maximo: number, mensaje: string): z.ZodType<string | undefined> {
  return z.preprocess(
    (valor) => (typeof valor === 'string' && valor.trim() === '' ? undefined : valor),
    z.string().trim().max(maximo, mensaje).optional(),
  );
}
