import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import type { BusResumen } from '../../../shared/contratos/flota';
import type { EstacionResumen, LineaResumen } from '../../../shared/contratos/red';
import type { UsuarioResumen } from '../../../shared/contratos/usuarios';
import { AlertaCapacidad } from '../../entities/alerta-capacidad.entity';
import { FlotaAdapter } from '../../infrastructure/adapters/flota.adapter';
import { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { UsuariosAdapter } from '../../infrastructure/adapters/usuarios.adapter';
import { avisoDe } from '../../services/avisos';
import { desplazamiento, Pagina } from '../../services/paginacion';
import { AlertaEnVista, FiltrosDeAlertas, ListarAlertas } from '../impl/listar-alertas.query';

interface Referencias {
  buses: Map<number, BusResumen>;
  lineas: Map<number, LineaResumen>;
  estaciones: Map<number, EstacionResumen>;
  usuarios: Map<number, UsuarioResumen>;
}

function porId<T extends { id: number }>(elementos: readonly T[]): Map<number, T> {
  return new Map(elementos.map((elemento) => [elemento.id, elemento]));
}

function sinRepetir(ids: readonly (number | null | undefined)[]): number[] {
  return [...new Set(ids.filter((id): id is number => typeof id === 'number'))];
}

function lineaDelBus(
  bus: BusResumen | undefined,
  lineas: Map<number, LineaResumen>,
): AlertaEnVista['linea'] {
  const linea = bus?.lineaId ? lineas.get(bus.lineaId) : undefined;
  return linea ? { id: linea.id, codigo: linea.codigo, nombre: linea.nombre } : null;
}

function quienAtendio(
  usuarioId: number | null,
  usuarios: Map<number, UsuarioResumen>,
): AlertaEnVista['atendidaPor'] {
  const usuario = usuarioId === null ? undefined : usuarios.get(usuarioId);
  return usuario ? { id: usuario.id, nombre: usuario.nombre } : null;
}

@QueryHandler(ListarAlertas)
export class ListarAlertasHandler implements IQueryHandler<ListarAlertas> {
  constructor(
    @InjectRepository(AlertaCapacidad) private readonly alertas: Repository<AlertaCapacidad>,
    private readonly red: RedAdapter,
    private readonly flota: FlotaAdapter,
    private readonly usuarios: UsuariosAdapter,
  ) {}

  async execute({ filtros, pagina }: ListarAlertas): Promise<Pagina<AlertaEnVista>> {
    const donde = await this.condiciones(filtros);
    if (donde === null) {
      return { elementos: [], total: 0, ...pagina };
    }
    const [filas, total] = await this.alertas.findAndCount({
      where: donde,
      order: { atendida: 'ASC', fechaHora: 'DESC', id: 'DESC' },
      skip: desplazamiento(pagina),
      take: pagina.tamano,
    });
    const referencias = await this.cargarReferencias(filas);
    return { elementos: filas.map((fila) => this.armar(fila, referencias)), total, ...pagina };
  }

  /** `null` cuando el filtro de línea no deja ningún bus y no hay nada que buscar. */
  private async condiciones(
    filtros: FiltrosDeAlertas,
  ): Promise<FindOptionsWhere<AlertaCapacidad> | null> {
    const donde: FindOptionsWhere<AlertaCapacidad> = {};
    if (filtros.estacionId !== undefined) {
      donde.estacionId = filtros.estacionId;
    }
    if (filtros.tipo !== undefined) {
      donde.tipo = filtros.tipo;
    }
    if (filtros.estado !== undefined) {
      donde.atendida = filtros.estado === 'atendida';
    }
    if (filtros.lineaId === undefined) {
      return donde;
    }
    const buses = await this.flota.busesDeLinea(filtros.lineaId);
    if (buses.length === 0) {
      return null;
    }
    donde.busId = In(buses.map((bus) => bus.id));
    return donde;
  }

  private async cargarReferencias(filas: readonly AlertaCapacidad[]): Promise<Referencias> {
    const buses = await this.flota.obtenerBuses(sinRepetir(filas.map((fila) => fila.busId)));
    const [lineas, estaciones, usuarios] = await Promise.all([
      this.red.obtenerLineas(sinRepetir(buses.map((bus) => bus.lineaId))),
      this.red.obtenerEstaciones(sinRepetir(filas.map((fila) => fila.estacionId))),
      this.usuarios.obtenerUsuarios(sinRepetir(filas.map((fila) => fila.atendidaPor))),
    ]);
    return {
      buses: porId(buses),
      lineas: porId(lineas),
      estaciones: porId(estaciones),
      usuarios: porId(usuarios),
    };
  }

  private armar(fila: AlertaCapacidad, referencias: Referencias): AlertaEnVista {
    const bus = referencias.buses.get(fila.busId);
    const estacion = referencias.estaciones.get(fila.estacionId);
    return {
      id: fila.id,
      tipo: fila.tipo,
      aviso: avisoDe(fila.tipo),
      porcentaje: fila.porcentajeOcupacion,
      fechaHora: fila.fechaHora.toISOString(),
      atendida: fila.atendida,
      estacion: {
        id: fila.estacionId,
        codigo: estacion?.codigo ?? '',
        nombre: estacion?.nombre ?? '',
      },
      bus: { id: fila.busId, placa: bus?.placa ?? '' },
      linea: lineaDelBus(bus, referencias.lineas),
      atendidaPor: quienAtendio(fila.atendidaPor, referencias.usuarios),
    };
  }
}
