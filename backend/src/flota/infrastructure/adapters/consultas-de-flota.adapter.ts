import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { BusResumen, ConsultasDeFlota } from '../../../shared/contratos/flota';
import { EstacionTieneParqueos } from '../../queries/impl/estacion-tiene-parqueos.query';
import { ListarBusesDeLinea } from '../../queries/impl/listar-buses-de-linea.query';
import { ObtenerBusesResumen } from '../../queries/impl/obtener-buses-resumen.query';

/** Lo que la flota ofrece a los demás módulos. Nunca lanza por un id inexistente. */
@Injectable()
export class ConsultasDeFlotaAdapter extends ConsultasDeFlota {
  constructor(private readonly consultas: QueryBus) {
    super();
  }

  estacionTieneParqueos(estacionId: number): Promise<boolean> {
    return this.consultas.execute(new EstacionTieneParqueos(estacionId));
  }

  async obtenerBus(id: number): Promise<BusResumen | null> {
    const [bus] = await this.consultas.execute(new ObtenerBusesResumen([id]));
    return bus ?? null;
  }

  obtenerBuses(ids: readonly number[]): Promise<BusResumen[]> {
    return this.consultas.execute(new ObtenerBusesResumen(ids));
  }

  busesDeLinea(lineaId: number): Promise<BusResumen[]> {
    return this.consultas.execute(new ListarBusesDeLinea(lineaId));
  }
}
