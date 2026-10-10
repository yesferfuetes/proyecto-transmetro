import type { BusResumen } from '../../shared/contratos/flota';
import {
  BusNoExiste,
  BusNoOperativo,
  BusNoSirveALaEstacion,
  EstacionAjena,
  PasajerosInvalidos,
} from '../errors/errores-de-alertas';
import type { FlotaAdapter } from '../infrastructure/adapters/flota.adapter';
import type { RedAdapter } from '../infrastructure/adapters/red.adapter';
import { porcentaje, superaElTope } from './umbrales';

export interface EntradaDeLectura {
  estacionId: number;
  busId: number;
  pasajeros: number | null;
  estacionDelActor: number | null;
}

export interface LecturaValida {
  bus: BusResumen;
  pasajeros: number;
  porcentaje: number;
}

function exigirEstacionPropia(estacionId: number, estacionDelActor: number | null): void {
  if (estacionDelActor === null || estacionDelActor !== estacionId) {
    throw new EstacionAjena();
  }
}

async function exigirBusOperativo(flota: FlotaAdapter, busId: number): Promise<BusResumen> {
  const bus = await flota.obtenerBus(busId);
  if (!bus) {
    throw new BusNoExiste();
  }
  if (bus.estado !== 'ACTIVO') {
    throw new BusNoOperativo(bus.placa);
  }
  return bus;
}

async function exigirQueElBusSirva(
  red: RedAdapter,
  bus: BusResumen,
  estacionId: number,
): Promise<void> {
  if (bus.lineaId === null) {
    throw new BusNoSirveALaEstacion(bus.placa);
  }
  const estaciones = await red.estacionesDeLinea(bus.lineaId);
  if (!estaciones.some((estacion) => estacion.id === estacionId)) {
    throw new BusNoSirveALaEstacion(bus.placa);
  }
}

function exigirPasajeros(pasajeros: number | null, capacidad: number): number {
  if (pasajeros === null || !Number.isInteger(pasajeros)) {
    throw new PasajerosInvalidos('Escribe un número entero de pasajeros.');
  }
  if (pasajeros < 0) {
    throw new PasajerosInvalidos('Los pasajeros no pueden ser negativos.');
  }
  if (superaElTope(pasajeros, capacidad)) {
    throw new PasajerosInvalidos('La cifra supera el 999 % de la capacidad del bus.');
  }
  return pasajeros;
}

/** Valida estación, bus y cifra de una lectura, en ese orden, y calcula su porcentaje. */
export async function validarLectura(
  red: RedAdapter,
  flota: FlotaAdapter,
  entrada: EntradaDeLectura,
): Promise<LecturaValida> {
  exigirEstacionPropia(entrada.estacionId, entrada.estacionDelActor);
  const bus = await exigirBusOperativo(flota, entrada.busId);
  await exigirQueElBusSirva(red, bus, entrada.estacionId);
  const pasajeros = exigirPasajeros(entrada.pasajeros, bus.capacidadMax);
  return { bus, pasajeros, porcentaje: porcentaje(pasajeros, bus.capacidadMax) };
}
