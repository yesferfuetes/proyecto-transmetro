import type { FindOptionsWhere, Repository } from 'typeorm';
import { ReporteConsulta } from '../../entities/reporte-consulta.entity';
import type { FlotaAdapter } from '../../infrastructure/adapters/flota.adapter';
import type { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { BUSES, FLOTA, RED } from '../../services/datos-de-prueba';

export const FECHA = new Date('2026-10-08T15:30:00Z');

export function constancia(parcial: Partial<ReporteConsulta> = {}): ReporteConsulta {
  return {
    id: 7,
    usuarioId: 9,
    tipoReporte: 'LINEAS',
    filtrosJson: null,
    fechaHora: FECHA,
    ...parcial,
  };
}

export interface Simulados {
  constancias: Pick<Repository<ReporteConsulta>, 'findOneBy'>;
  /** Condiciones con que se buscó la constancia, en orden. */
  busquedas: FindOptionsWhere<ReporteConsulta>[];
  red: RedAdapter;
  flota: FlotaAdapter;
}

/** Repositorio, red y flota simulados: la constancia 7 es del usuario 9. */
export function simular(guardada: ReporteConsulta | null = constancia()): Simulados {
  const busquedas: FindOptionsWhere<ReporteConsulta>[] = [];
  return {
    busquedas,
    constancias: {
      findOneBy: (donde): Promise<ReporteConsulta | null> => {
        busquedas.push(donde as FindOptionsWhere<ReporteConsulta>);
        return Promise.resolve(guardada);
      },
    },
    red: { obtenerRed: () => Promise.resolve(RED) } as unknown as RedAdapter,
    flota: {
      listarBuses: () => Promise.resolve(BUSES),
      resumenDeFlotaPorLinea: () => Promise.resolve(FLOTA),
    } as unknown as FlotaAdapter,
  };
}
