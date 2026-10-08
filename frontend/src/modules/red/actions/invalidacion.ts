import 'server-only';
import { revalidatePath } from 'next/cache';

export function invalidarLinea(id: number): void {
  revalidatePath('/lineas');
  revalidatePath(`/lineas/${id}`);
}

export function invalidarEstacion(id: number): void {
  revalidatePath('/estaciones');
  revalidatePath(`/estaciones/${id}`);
}

export function invalidarMunicipalidades(): void {
  revalidatePath('/municipalidades');
}
