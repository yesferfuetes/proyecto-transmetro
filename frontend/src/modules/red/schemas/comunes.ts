import { z } from 'zod';

export const esquemaEstadoLinea = z.enum(['ACTIVA', 'INACTIVA', 'EN_CONSTRUCCION'], {
  error: 'Elige un estado.',
});

export type EstadoLinea = z.infer<typeof esquemaEstadoLinea>;

export const ETIQUETA_DE_ESTADO: Readonly<Record<EstadoLinea, string>> = {
  ACTIVA: 'Activa',
  EN_CONSTRUCCION: 'En construcción',
  INACTIVA: 'Inactiva',
};

/** Kilómetros con hasta tres decimales, tal como los entrega el backend. */
export const esquemaKm = z.number().nonnegative();

/** Identificador numérico positivo; acepta el texto de una ruta o de un campo. */
export const esquemaId = z.coerce.number().int().positive();

/** Filtro de identificador en la URL: un valor que no sirve se ignora. */
export const esquemaIdOpcional = esquemaId.optional().catch(undefined);

export const esquemaCodigo = z
  .string({ error: 'Escribe el código.' })
  .trim()
  .min(1, 'Escribe el código.')
  .max(10, 'Usa como máximo 10 caracteres.');

export const esquemaNombre = z
  .string({ error: 'Escribe el nombre.' })
  .trim()
  .min(1, 'Escribe el nombre.')
  .max(150, 'Usa como máximo 150 caracteres.');

/** Municipalidad elegida en una lista: el valor vacío significa que falta. */
export const esquemaMunicipalidadElegida = z.coerce
  .number({ error: 'Elige una municipalidad.' })
  .int('Elige una municipalidad.')
  .positive('Elige una municipalidad.');

export const esquemaNumeroDePagina = z.coerce.number().int().positive().catch(1);

export const esquemaReferencia = z.object({ id: z.number().int().positive(), nombre: z.string() });

export const esquemaCreado = z.object({ id: z.number().int().positive() });

/** Respuesta vacía de las escrituras que no devuelven nada. */
export const esquemaSinContenido = z.undefined();

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

/** Número escrito en un campo; vacío cuenta como no escrito. */
export function numeroOpcional(esquema: z.ZodNumber): z.ZodType<number | undefined> {
  return z.preprocess((valor) => {
    if (valor === '' || valor === null || valor === undefined) {
      return undefined;
    }
    return typeof valor === 'string' ? Number(valor) : valor;
  }, esquema.optional());
}
