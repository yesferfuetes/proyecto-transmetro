import type { Repository } from 'typeorm';
import type { BusConParqueo, FlotaDeLineaResumen } from '../../../shared/contratos/flota';
import type { RedCompleta } from '../../../shared/contratos/red';
import type { ReporteConsulta } from '../../entities/reporte-consulta.entity';
import { ConsultaNoExiste, TipoDeReporteInvalido } from '../../errors/errores-de-reportes';
import type { FlotaAdapter } from '../../infrastructure/adapters/flota.adapter';
import type { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { describirFiltros } from '../../services/describir-filtros';
import { leerFiltros } from '../../services/filtros';
import {
  ConsultaDeReporte,
  esTipoDeReporte,
  FiltrosDeReporte,
  TipoDeReporte,
} from '../../services/tipos-de-reporte';

export interface ConsultaLeida {
  tipo: TipoDeReporte;
  filtros: FiltrosDeReporte;
  fechaHora: Date;
  id: number;
}

/**
 * La constancia del actor. Una constancia ajena o inexistente es `CONSULTA_NO_EXISTE`; una de otro
 * tipo que el esperado, `TIPO_DE_REPORTE_INVALIDO`.
 */
export async function leerConsultaPropia(
  constancias: Repository<ReporteConsulta>,
  consultaId: number,
  actorId: number,
  esperado?: TipoDeReporte,
): Promise<ConsultaLeida> {
  const constancia = await constancias.findOneBy({ id: consultaId, usuarioId: actorId });
  if (!constancia) {
    throw new ConsultaNoExiste();
  }
  const tipo = constancia.tipoReporte;
  if (!esTipoDeReporte(tipo) || (esperado !== undefined && tipo !== esperado)) {
    throw new TipoDeReporteInvalido();
  }
  return {
    id: constancia.id,
    tipo,
    filtros: leerFiltros(constancia.filtrosJson),
    fechaHora: constancia.fechaHora,
  };
}

export function consultaParaReporte(consulta: ConsultaLeida, red: RedCompleta): ConsultaDeReporte {
  return {
    id: consulta.id,
    tipo: consulta.tipo,
    filtros: describirFiltros(consulta.filtros, red),
    fechaHora: consulta.fechaHora,
  };
}

export interface DatosDeReporte {
  red: RedCompleta;
  buses: BusConParqueo[];
  flota: FlotaDeLineaResumen[];
}

/** La red y la flota de este momento, una sola vez por reporte. */
export async function cargarDatos(red: RedAdapter, flota: FlotaAdapter): Promise<DatosDeReporte> {
  const [laRed, buses, resumen] = await Promise.all([
    red.obtenerRed(),
    flota.listarBuses(),
    flota.resumenDeFlotaPorLinea(),
  ]);
  return { red: laRed, buses, flota: resumen };
}
