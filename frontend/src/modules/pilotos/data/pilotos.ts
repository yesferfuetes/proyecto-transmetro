import 'server-only';
import { solicitarConSesion } from '@/shared/lib/http/cliente-backend';
import type { Resultado } from '@/shared/lib/http/resultado';
import { obtenerSesion } from '@/shared/lib/sesion/sesion';
import { esquemaCreado, esquemaSinContenido } from '../schemas/comunes';
import {
  esquemaOpciones,
  esquemaPaginaCompleta,
  esquemaPaginaReducida,
  esquemaPilotoCompleto,
  esquemaPilotoReducido,
  type CambioDeBus,
  type EdicionDePiloto,
  type FichaDePiloto,
  type FiltrosPilotos,
  type FormularioPiloto,
  type ListadoDePilotos,
  type Opciones,
} from '../schemas/piloto';
import { rutaConConsulta, TIEMPO_DE_ESPERA_MS } from './parametros';

/** Filas por página del listado de pilotos. */
export const TAMANO_DE_PAGINA = 25;

/** Solo el supervisor y el administrador ven el expediente; cualquier otro caso ve la ficha reducida. */
async function veExpedienteCompleto(): Promise<boolean> {
  const sesion = await obtenerSesion();
  return sesion?.rol === 'SUPERVISOR_MUNICIPAL' || sesion?.rol === 'ADMINISTRADOR';
}

export async function listarPilotos(filtros: FiltrosPilotos): Promise<Resultado<ListadoDePilotos>> {
  const completa = await veExpedienteCompleto();
  const ruta = rutaConConsulta('/pilotos', {
    lineaId: filtros.lineaId,
    busId: filtros.busId,
    sinBus: filtros.sinBus === '1' ? true : undefined,
    busqueda: filtros.busqueda,
    pagina: filtros.pagina,
    tamano: TAMANO_DE_PAGINA,
  });
  if (completa) {
    const resultado = await solicitarConSesion({
      ruta,
      esquema: esquemaPaginaCompleta,
      tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
    });
    return resultado.ok
      ? { ok: true, datos: { vista: 'completa', pagina: resultado.datos } }
      : resultado;
  }
  const resultado = await solicitarConSesion({
    ruta,
    esquema: esquemaPaginaReducida,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
  return resultado.ok
    ? { ok: true, datos: { vista: 'reducida', pagina: resultado.datos } }
    : resultado;
}

export async function obtenerPiloto(id: number): Promise<Resultado<FichaDePiloto>> {
  const completa = await veExpedienteCompleto();
  if (completa) {
    const resultado = await solicitarConSesion({
      ruta: `/pilotos/${id}`,
      esquema: esquemaPilotoCompleto,
      tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
    });
    return resultado.ok
      ? { ok: true, datos: { vista: 'completa', piloto: resultado.datos } }
      : resultado;
  }
  const resultado = await solicitarConSesion({
    ruta: `/pilotos/${id}`,
    esquema: esquemaPilotoReducido,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
  return resultado.ok
    ? { ok: true, datos: { vista: 'reducida', piloto: resultado.datos } }
    : resultado;
}

/** Buses que reciben pilotos (no de baja) y líneas que tienen buses. */
export function listarOpciones(): Promise<Resultado<Opciones>> {
  return solicitarConSesion({
    ruta: '/pilotos/opciones',
    esquema: esquemaOpciones,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

export function registrarPilotoEnBackend(
  datos: FormularioPiloto,
): Promise<Resultado<{ id: number }>> {
  return solicitarConSesion({
    ruta: '/pilotos',
    metodo: 'POST',
    cuerpo: datos,
    esquema: esquemaCreado,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

export function editarPilotoEnBackend(
  id: number,
  datos: EdicionDePiloto,
): Promise<Resultado<undefined>> {
  return solicitarConSesion({
    ruta: `/pilotos/${id}`,
    metodo: 'PATCH',
    cuerpo: datos,
    esquema: esquemaSinContenido,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}

export function cambiarBusEnBackend(id: number, datos: CambioDeBus): Promise<Resultado<undefined>> {
  return solicitarConSesion({
    ruta: `/pilotos/${id}/bus`,
    metodo: 'PUT',
    cuerpo: datos,
    esquema: esquemaSinContenido,
    tiempoEsperaMs: TIEMPO_DE_ESPERA_MS,
  });
}
