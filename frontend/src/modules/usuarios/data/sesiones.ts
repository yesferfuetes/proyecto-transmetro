import 'server-only';
import { solicitar } from '@/shared/lib/http/cliente-backend';
import type { Resultado } from '@/shared/lib/http/resultado';
import { esquemaRespuestaSesion, type Credenciales, type RespuestaSesion } from '../schemas/sesion';

const TIEMPO_DE_ESPERA_MS = 5000;

/** Abre una sesión en el backend. Es la única llamada que no lleva token. */
export async function crearSesion(credenciales: Credenciales): Promise<Resultado<RespuestaSesion>> {
  return solicitar({
    ruta: '/sesiones',
    metodo: 'POST',
    cuerpo: credenciales,
    esquema: esquemaRespuestaSesion,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}
