import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { LineaEstacion } from '../../entities/linea-estacion.entity';
import { Linea } from '../../entities/linea.entity';
import { kmAMetros, metrosAKm } from '../../services/distancias';
import { leerEstadoDeLinea } from '../../services/estados-de-linea';
import { DetalleDeLinea, ObtenerLinea, ParadaDelRecorrido } from '../impl/obtener-linea.query';

@QueryHandler(ObtenerLinea)
export class ObtenerLineaHandler implements IQueryHandler<ObtenerLinea> {
  constructor(
    @InjectRepository(Linea) private readonly lineas: Repository<Linea>,
    @InjectRepository(LineaEstacion) private readonly recorridos: Repository<LineaEstacion>,
  ) {}

  async execute({ id }: ObtenerLinea): Promise<DetalleDeLinea | null> {
    const linea = await this.lineas.findOne({ where: { id }, relations: { municipalidad: true } });
    if (!linea) {
      return null;
    }
    const paradas = await this.recorridos.find({
      where: { lineaId: id },
      relations: { estacion: { municipalidad: true } },
      order: { ordenSecuencia: 'ASC' },
    });
    return {
      id: linea.id,
      codigo: linea.codigo,
      nombre: linea.nombre,
      municipalidad: { id: linea.municipalidadId, nombre: linea.municipalidad?.nombre ?? '' },
      estado: leerEstadoDeLinea(linea.estado),
      longitudKm: linea.longitudKm,
      creadoEn: linea.creadoEn.toISOString(),
      recorrido: conDistanciaAcumulada(paradas),
    };
  }
}

/** Cada parada con la distancia recorrida desde la primera; la suma se hace en metros enteros. */
function conDistanciaAcumulada(paradas: readonly LineaEstacion[]): ParadaDelRecorrido[] {
  let acumuladaEnMetros = 0;
  return paradas.map((parada) => {
    const distanciaAcumuladaKm = metrosAKm(acumuladaEnMetros);
    acumuladaEnMetros += kmAMetros(parada.distanciaSiguienteKm ?? 0);
    return {
      posicion: parada.ordenSecuencia,
      estacion: {
        id: parada.estacionId,
        codigo: parada.estacion?.codigo ?? '',
        nombre: parada.estacion?.nombre ?? '',
        municipalidadNombre: parada.estacion?.municipalidad?.nombre ?? '',
      },
      distanciaSiguienteKm: parada.distanciaSiguienteKm,
      distanciaAcumuladaKm,
    };
  });
}
