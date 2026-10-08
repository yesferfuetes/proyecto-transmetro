import type { z } from 'zod';
import type { ErrorDeBackend } from '@/shared/lib/http/resultado';

/** Lo que devuelve una acción de servidor al formulario que la llamó. */
export type EstadoDeAccion = { ok: true } | { ok: false; error: ErrorDeBackend };

/** Convierte un fallo de Zod en el mismo sobre que usa el backend para la entrada inválida. */
export function errorDeEntrada(error: z.ZodError): { ok: false; error: ErrorDeBackend } {
  const porCampo = new Map<string, string[]>();
  for (const problema of error.issues) {
    const campo = problema.path.map(String).join('.');
    porCampo.set(campo, [...(porCampo.get(campo) ?? []), problema.message]);
  }
  return {
    ok: false,
    error: {
      codigo: 'ENTRADA_INVALIDA',
      mensaje: 'Revisa los datos marcados.',
      detalles: [...porCampo].map(([campo, mensajes]) => ({ campo, mensajes })),
      estado: 0,
    },
  };
}
