export const TAMANO_DE_PAGINA = 25;
export const TAMANO_MAXIMO_DE_PAGINA = 100;

export interface Pagina<T> {
  elementos: T[];
  total: number;
  pagina: number;
  tamano: number;
}

export interface SolicitudDePagina {
  pagina: number;
  tamano: number;
}

/** Filas que se saltan para llegar a la página pedida (la primera es la 1). */
export function desplazamiento({ pagina, tamano }: SolicitudDePagina): number {
  return (pagina - 1) * tamano;
}

export function paginar<T>(filas: readonly T[], solicitud: SolicitudDePagina): Pagina<T> {
  const inicio = desplazamiento(solicitud);
  return {
    elementos: filas.slice(inicio, inicio + solicitud.tamano),
    total: filas.length,
    ...solicitud,
  };
}
