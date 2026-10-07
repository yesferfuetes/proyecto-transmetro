import { z } from 'zod';

export const esquemaEntorno = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
});

export type Entorno = z.infer<typeof esquemaEntorno>;

/** Valida las variables de entorno al arrancar. Si alguna falta o es inválida, la app no inicia. */
export function validarEntorno(variables: Record<string, unknown>): Entorno {
  const resultado = esquemaEntorno.safeParse(variables);
  if (!resultado.success) {
    const problemas = resultado.error.issues
      .map((problema) => `${problema.path.join('.')}: ${problema.message}`)
      .join('; ');
    throw new Error(`Variables de entorno inválidas. ${problemas}`);
  }
  return resultado.data;
}
