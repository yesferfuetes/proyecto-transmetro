import 'server-only';
import { solicitarConSesion } from '@/shared/lib/http/cliente-backend';
import type { Resultado } from '@/shared/lib/http/resultado';
import { esquemaOpciones, type OpcionesDeReporte } from '../schemas/opciones';
import { TIEMPO_DE_ESPERA_MS } from './parametros';

/** Líneas, estaciones, municipalidades y usuarios con consultas, para los formularios y filtros. */
export function listarOpciones(): Promise<Resultado<OpcionesDeReporte>> {
  return solicitarConSesion({
    ruta: '/reportes/opciones',
    esquema: esquemaOpciones,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}
