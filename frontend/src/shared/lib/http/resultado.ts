/** Error tal como lo entrega el backend, o generado por el cliente si no hubo respuesta válida. */
export interface ErrorDeBackend {
  codigo: string;
  mensaje: string;
  detalles: { campo: string; mensajes: string[] }[];
  /** Estado HTTP; 0 cuando no hubo respuesta. */
  estado: number;
}

export type Resultado<T> = { ok: true; datos: T } | { ok: false; error: ErrorDeBackend };

/** Códigos que genera el cliente cuando no puede usar la respuesta del backend. */
export const CODIGOS_DEL_CLIENTE = {
  tiempoAgotado: 'TIEMPO_AGOTADO',
  noDisponible: 'BACKEND_NO_DISPONIBLE',
  respuestaInvalida: 'RESPUESTA_INVALIDA',
} as const;
