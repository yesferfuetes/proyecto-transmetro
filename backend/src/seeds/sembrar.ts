import type { DataSource } from 'typeorm';
import { sembrarAccesos } from './grupos/accesos';
import { sembrarFlota } from './grupos/flota';
import { sembrarPilotos } from './grupos/pilotos';
import { sembrarRed } from './grupos/red';
import { sembrarUsuarios } from './grupos/usuarios';
import type { Resumen } from './sincronizar';

export type ResumenDeSiembra = Record<
  'red' | 'usuarios' | 'accesos' | 'flota' | 'pilotos',
  Resumen
>;

export interface OpcionesDeSiembra {
  /** Contraseña inicial de los usuarios de la demo que todavía no existen. */
  contrasenaDeUsuarios: string;
}

/** Siembra todos los grupos en orden de dependencia, dentro de una sola transacción. */
export function sembrar(
  fuente: DataSource,
  opciones: OpcionesDeSiembra,
): Promise<ResumenDeSiembra> {
  return fuente.transaction(async (gestor) => ({
    red: await sembrarRed(gestor),
    usuarios: await sembrarUsuarios(gestor, opciones.contrasenaDeUsuarios),
    accesos: await sembrarAccesos(gestor),
    flota: await sembrarFlota(gestor),
    pilotos: await sembrarPilotos(gestor),
  }));
}
