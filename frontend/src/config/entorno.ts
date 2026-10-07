import 'server-only';
import { z } from 'zod';

const esquemaEntorno = z.object({
  BACKEND_URL: z.url({ protocol: /^https?$/ }),
});

export type Entorno = z.infer<typeof esquemaEntorno>;

/**
 * Variables de entorno del servidor, validadas. Se leen al usarse y no al importar el módulo,
 * para que la construcción no dependa de ellas; `instrumentation.ts` las valida al arrancar.
 */
export function leerEntorno(variables: Record<string, string | undefined> = process.env): Entorno {
  const resultado = esquemaEntorno.safeParse(variables);
  if (!resultado.success) {
    const problemas = resultado.error.issues
      .map((problema) => `${problema.path.join('.')}: ${problema.message}`)
      .join('; ');
    throw new Error(`Variables de entorno inválidas. ${problemas}`);
  }
  return resultado.data;
}
