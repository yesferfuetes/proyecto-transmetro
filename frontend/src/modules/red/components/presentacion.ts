/** Fecha AAAA-MM-DD del backend como DD/MM/AAAA, sin pasar por la zona horaria. */
export function formatearFecha(fecha: string | null): string {
  if (fecha === null) {
    return '—';
  }
  const [anio, mes, dia] = fecha.slice(0, 10).split('-');
  return `${dia}/${mes}/${anio}`;
}

type ValorDeFiltro = string | number | undefined;

/** Enlace a un listado con sus filtros; omite los vacíos para que la URL quede limpia. */
export function hrefConFiltros(
  base: string,
  filtros: Readonly<Record<string, ValorDeFiltro>>,
): string {
  const consulta = new URLSearchParams();
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor !== undefined && valor !== '') {
      consulta.set(clave, String(valor));
    }
  }
  const texto = consulta.toString();
  return texto === '' ? base : `${base}?${texto}`;
}
