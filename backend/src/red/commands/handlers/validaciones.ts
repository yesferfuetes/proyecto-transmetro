import type { Repository } from 'typeorm';
import type { ContextoTransaccional } from '../../../shared/database/unidad-de-trabajo';
import { Municipalidad } from '../../entities/municipalidad.entity';
import {
  CoordenadasInvalidas,
  MunicipalidadAsignadaNoExiste,
  MunicipalidadDuplicada,
} from '../../errors/errores-de-red';

/** Toda línea y toda estación pertenecen a una municipalidad existente. */
export async function exigirMunicipalidadAsignada(
  contexto: ContextoTransaccional,
  municipalidadId: number,
): Promise<void> {
  const existe = await contexto.repositorio(Municipalidad).existsBy({ id: municipalidadId });
  if (!existe) {
    throw new MunicipalidadAsignadaNoExiste();
  }
}

/**
 * El nombre de una municipalidad es único sin distinguir mayúsculas ni espacios a los lados.
 * Las municipalidades son pocas: se comparan en memoria.
 */
export async function exigirNombreDeMunicipalidadLibre(
  municipalidades: Repository<Municipalidad>,
  nombre: string,
  excluirId?: number,
): Promise<void> {
  const clave = claveDeNombre(nombre);
  const registradas = await municipalidades.find({ select: { id: true, nombre: true } });
  const duplicada = registradas.some(
    (municipalidad) =>
      municipalidad.id !== excluirId && claveDeNombre(municipalidad.nombre) === clave,
  );
  if (duplicada) {
    throw new MunicipalidadDuplicada(nombre);
  }
}

function claveDeNombre(nombre: string): string {
  return nombre.trim().toLocaleLowerCase('es');
}

/** Coordenadas opcionales: las dos o ninguna, dentro de su rango. */
export function validarCoordenadas(latitud: number | null, longitud: number | null): void {
  if (latitud === null && longitud === null) {
    return;
  }
  if (latitud === null || longitud === null || !enRango(latitud, 90) || !enRango(longitud, 180)) {
    throw new CoordenadasInvalidas();
  }
}

function enRango(valor: number, limite: number): boolean {
  return Number.isFinite(valor) && valor >= -limite && valor <= limite;
}

/** Solo los campos que traen un valor distinto del actual; los ausentes no cambian. */
export function cambiosEfectivos<T extends object>(actual: T, cambios: Partial<T>): Partial<T> {
  const efectivos: Partial<T> = {};
  for (const campo of Object.keys(cambios) as (keyof T)[]) {
    const valor = cambios[campo];
    if (valor !== undefined && valor !== actual[campo]) {
      efectivos[campo] = valor;
    }
  }
  return efectivos;
}
