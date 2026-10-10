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

const PORCENTAJE = new Intl.NumberFormat('es-GT', { maximumFractionDigits: 2 });

/** Porcentaje con hasta dos decimales, por ejemplo "150 %". */
export function formatearPorcentaje(valor: number): string {
  return `${PORCENTAJE.format(valor)} %`;
}
