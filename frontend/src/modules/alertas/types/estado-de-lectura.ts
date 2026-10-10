import type { ErrorDeBackend } from '@/shared/lib/http/resultado';

/** Lo que devuelve el registro de una lectura al formulario: `alertaId: null` es "no corresponde". */
export type EstadoDeLectura =
  { ok: true; alertaId: number | null } | { ok: false; error: ErrorDeBackend };
