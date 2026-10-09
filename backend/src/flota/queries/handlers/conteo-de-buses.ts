import type { Repository } from 'typeorm';
import type { Bus } from '../../entities/bus.entity';
import { aNumero } from '../../services/lectura';

/** Buses asignados a cada línea; las líneas sin buses no aparecen. */
export async function contarBusesPorLinea(buses: Repository<Bus>): Promise<Map<number, number>> {
  const filas = await buses
    .createQueryBuilder('b')
    .select('b.linea_id', 'lineaId')
    .addSelect('COUNT(*)', 'buses')
    .where('b.linea_id IS NOT NULL')
    .groupBy('b.linea_id')
    .getRawMany<{ lineaId: number; buses: string }>();
  return new Map(filas.map((fila) => [fila.lineaId, aNumero(fila.buses)]));
}
