import type { TipoDeAlerta } from './tipos-de-alerta';

const AVISOS: Record<TipoDeAlerta, string> = {
  SOBRECUPO: 'Hace falta otra unidad en esta estación.',
  BAJA_OCUPACION: 'Debe esperar 5 minutos adicionales en esta estación.',
};

/** Texto de la regla para el tipo de alerta; un tipo desconocido no lleva aviso. */
export function avisoDe(tipo: string): string {
  return AVISOS[tipo as TipoDeAlerta] ?? '';
}
