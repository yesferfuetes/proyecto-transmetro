import type { FiltrosUsuarios } from '../schemas/usuario';

/** Dirección del listado con los filtros dados; la página 1 no se escribe. */
export function hrefDelListado(filtros: Partial<FiltrosUsuarios>): string {
  const parametros = new URLSearchParams();
  const valores: Record<string, string | number | undefined> = {
    rol: filtros.rol,
    estacionId: filtros.estacionId,
    activo: filtros.activo,
    busqueda: filtros.busqueda,
    pagina: filtros.pagina === 1 ? undefined : filtros.pagina,
  };
  for (const [clave, valor] of Object.entries(valores)) {
    if (valor !== undefined) {
      parametros.set(clave, String(valor));
    }
  }
  const consulta = parametros.toString();
  return consulta === '' ? '/usuarios' : `/usuarios?${consulta}`;
}

export function hayFiltros(filtros: FiltrosUsuarios): boolean {
  return [filtros.rol, filtros.estacionId, filtros.activo, filtros.busqueda].some(
    (valor) => valor !== undefined,
  );
}
