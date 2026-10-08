import 'server-only';
import { z } from 'zod';
import { leerEntorno } from '@/config/entorno';
import { leerToken } from '@/shared/lib/sesion/cookie';
import { CODIGOS_DEL_CLIENTE, ErrorDeBackend, Resultado } from './resultado';

export type MetodoHttp = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface OpcionesDeSolicitud<T> {
  ruta: string;
  /** Esquema que debe cumplir la respuesta exitosa; si no la cumple, no se usa. */
  esquema: z.ZodType<T>;
  metodo?: MetodoHttp;
  cuerpo?: unknown;
  cabeceras?: Record<string, string>;
  tiempoEsperaMs?: number;
  /** Token de la sesión; viaja como `Authorization: Bearer`. */
  token?: string;
}

const TIEMPO_DE_ESPERA_POR_DEFECTO_MS = 5000;

const esquemaSobreDeError = z.object({
  codigo: z.string(),
  mensaje: z.string(),
  detalles: z.array(z.object({ campo: z.string(), mensajes: z.array(z.string()) })),
});

/**
 * Única puerta hacia el backend. Solo se ejecuta en el servidor, siempre con tiempo de espera,
 * sin caché compartida, y valida la respuesta antes de entregarla.
 */
export async function solicitar<T>(opciones: OpcionesDeSolicitud<T>): Promise<Resultado<T>> {
  let respuesta: Response;
  try {
    respuesta = await fetch(new URL(opciones.ruta, leerEntorno().BACKEND_URL), {
      method: opciones.metodo ?? 'GET',
      headers: cabecerasDe(opciones),
      body: opciones.cuerpo === undefined ? undefined : JSON.stringify(opciones.cuerpo),
      cache: 'no-store',
      signal: AbortSignal.timeout(opciones.tiempoEsperaMs ?? TIEMPO_DE_ESPERA_POR_DEFECTO_MS),
    });
  } catch (error) {
    return fallo(esTiempoAgotado(error) ? errorDeTiempo() : errorDeConexion());
  }

  const cuerpo = await leerCuerpo(respuesta);
  if (!cuerpo.valido) {
    return fallo(errorDeRespuesta(respuesta.status));
  }
  if (!respuesta.ok) {
    return fallo(traducirError(cuerpo.valor, respuesta.status));
  }
  const datos = opciones.esquema.safeParse(cuerpo.valor);
  return datos.success
    ? { ok: true, datos: datos.data }
    : fallo(errorDeRespuesta(respuesta.status));
}

function cabecerasDe<T>(opciones: OpcionesDeSolicitud<T>): Record<string, string> {
  return {
    ...(opciones.cuerpo === undefined ? {} : { 'Content-Type': 'application/json' }),
    ...(opciones.token === undefined ? {} : { Authorization: `Bearer ${opciones.token}` }),
    ...opciones.cabeceras,
  };
}

/** Igual que `solicitar`, con el token de la cookie de sesión. */
export async function solicitarConSesion<T>(
  opciones: Omit<OpcionesDeSolicitud<T>, 'token'>,
): Promise<Resultado<T>> {
  return solicitar({ ...opciones, token: await leerToken() });
}

type CuerpoLeido = { valido: true; valor: unknown } | { valido: false };

async function leerCuerpo(respuesta: Response): Promise<CuerpoLeido> {
  const texto = await respuesta.text();
  if (texto === '') {
    return { valido: true, valor: undefined };
  }
  try {
    return { valido: true, valor: JSON.parse(texto) as unknown };
  } catch {
    return { valido: false };
  }
}

function traducirError(cuerpo: unknown, estado: number): ErrorDeBackend {
  const sobre = esquemaSobreDeError.safeParse(cuerpo);
  return sobre.success ? { ...sobre.data, estado } : errorDeRespuesta(estado);
}

function esTiempoAgotado(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'TimeoutError';
}

function fallo<T>(error: ErrorDeBackend): Resultado<T> {
  return { ok: false, error };
}

function errorDeTiempo(): ErrorDeBackend {
  return {
    codigo: CODIGOS_DEL_CLIENTE.tiempoAgotado,
    mensaje: 'El servidor tardó demasiado en responder. Intenta de nuevo.',
    detalles: [],
    estado: 0,
  };
}

function errorDeConexion(): ErrorDeBackend {
  return {
    codigo: CODIGOS_DEL_CLIENTE.noDisponible,
    mensaje: 'No fue posible comunicarse con el servidor. Intenta de nuevo.',
    detalles: [],
    estado: 0,
  };
}

function errorDeRespuesta(estado: number): ErrorDeBackend {
  return {
    codigo: CODIGOS_DEL_CLIENTE.respuestaInvalida,
    mensaje: 'El servidor respondió con datos inesperados.',
    detalles: [],
    estado,
  };
}
