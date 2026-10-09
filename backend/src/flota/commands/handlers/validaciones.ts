import type { Repository } from 'typeorm';
import type { ContextoTransaccional } from '../../../shared/database/unidad-de-trabajo';
import { Bus } from '../../entities/bus.entity';
import { Parqueo } from '../../entities/parqueo.entity';
import {
  CAPACIDAD_MAXIMA_DE_BUS,
  CapacidadInvalida,
  FlotaMaximaExcedida,
  FlotaMinimaInsuficiente,
  LARGO_MAXIMO_DE_PLACA,
  LineaInactiva,
  LineaNoExiste,
  ParqueoLleno,
  PlacaInvalida,
} from '../../errors/errores-de-flota';
import type { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import { normalizarPlaca } from '../../services/normalizacion';
import { rangoDeFlota } from '../../services/rango-de-flota';

/** Espacio del candado que serializa las operaciones sobre los buses de una misma línea. */
export const ESPACIO_DE_LINEA = 'flota-linea';

/** La placa normalizada, o `PLACA_INVALIDA` si queda vacía o excede el largo. */
export function validarPlaca(placa: string): string {
  const normalizada = normalizarPlaca(placa);
  if (normalizada.length < 1 || normalizada.length > LARGO_MAXIMO_DE_PLACA) {
    throw new PlacaInvalida();
  }
  return normalizada;
}

export function validarCapacidadDeBus(capacidad: number): void {
  if (!Number.isInteger(capacidad) || capacidad < 1 || capacidad > CAPACIDAD_MAXIMA_DE_BUS) {
    throw new CapacidadInvalida(
      'capacidadMax',
      `La capacidad debe ser un entero entre 1 y ${CAPACIDAD_MAXIMA_DE_BUS} pasajeros.`,
    );
  }
}

export function validarCapacidadDeParqueo(capacidad: number): void {
  if (!Number.isInteger(capacidad) || capacidad < 1) {
    throw new CapacidadInvalida(
      'capacidadVehiculos',
      'La capacidad debe ser un entero mayor que 0.',
    );
  }
}

/** Pide el candado de cada línea, una sola vez y en orden ascendente de id. */
export async function bloquearLineas(
  contexto: ContextoTransaccional,
  ids: readonly (number | null)[],
): Promise<void> {
  const ordenadas = [...new Set(ids.filter((id): id is number => id !== null))].sort(
    (a, b) => a - b,
  );
  for (const id of ordenadas) {
    await contexto.bloquear(ESPACIO_DE_LINEA, id);
  }
}

/** La línea que recibe un bus existe, no está inactiva y no pasa de 2n buses con él. */
export async function exigirLineaQueRecibe(
  red: RedAdapter,
  buses: Repository<Bus>,
  lineaId: number,
): Promise<void> {
  const linea = await red.obtenerLinea(lineaId);
  if (!linea) {
    throw new LineaNoExiste();
  }
  if (linea.estado === 'INACTIVA') {
    throw new LineaInactiva(linea.codigo);
  }
  const actuales = await buses.countBy({ lineaId });
  const { maximo } = rangoDeFlota(linea.numeroDeEstaciones);
  if (actuales + 1 > maximo) {
    throw new FlotaMaximaExcedida(linea.codigo, maximo, actuales);
  }
}

/** Una línea activa no queda por debajo de n buses al perder uno. */
export async function exigirMinimoAlQuitar(
  red: RedAdapter,
  buses: Repository<Bus>,
  lineaId: number,
): Promise<void> {
  const linea = await red.obtenerLinea(lineaId);
  if (linea?.estado !== 'ACTIVA') {
    return;
  }
  const actuales = await buses.countBy({ lineaId });
  const { minimo } = rangoDeFlota(linea.numeroDeEstaciones);
  if (actuales - 1 < minimo) {
    throw new FlotaMinimaInsuficiente(linea.codigo, minimo, actuales);
  }
}

/** El parqueo no guarda más buses que su capacidad, contando el que llega. */
export async function exigirCupoEnParqueo(buses: Repository<Bus>, parqueo: Parqueo): Promise<void> {
  const guardados = await buses.countBy({ parqueoId: parqueo.id });
  if (guardados + 1 > parqueo.capacidadVehiculos) {
    throw new ParqueoLleno(parqueo.codigo, parqueo.capacidadVehiculos);
  }
}
