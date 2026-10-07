import type { DataSource } from 'typeorm';
import { sembrarAccesos } from './grupos/accesos';
import { sembrarFlota } from './grupos/flota';
import { sembrarPilotos } from './grupos/pilotos';
import { sembrarRed } from './grupos/red';
import type { Resumen } from './sincronizar';

export type ResumenDeSiembra = Record<'red' | 'accesos' | 'flota' | 'pilotos', Resumen>;

/** Siembra todos los grupos en orden de dependencia, dentro de una sola transacción. */
export function sembrar(fuente: DataSource): Promise<ResumenDeSiembra> {
  return fuente.transaction(async (gestor) => ({
    red: await sembrarRed(gestor),
    accesos: await sembrarAccesos(gestor),
    flota: await sembrarFlota(gestor),
    pilotos: await sembrarPilotos(gestor),
  }));
}
