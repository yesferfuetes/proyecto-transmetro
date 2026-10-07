import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Compone clases condicionales y resuelve los conflictos de Tailwind a favor de la última. */
export function cn(...entradas: ClassValue[]): string {
  return twMerge(clsx(entradas));
}
