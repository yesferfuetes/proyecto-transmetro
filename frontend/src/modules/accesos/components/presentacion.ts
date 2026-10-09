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

/** "1 guardia" o "3 guardias". */
export function textoDeGuardias(cantidad: number): string {
  return `${cantidad} ${cantidad === 1 ? 'guardia' : 'guardias'}`;
}

/** Texto con que se nombra un acceso en enlaces y mensajes: "A · Principal" o solo "A". */
export function rotuloDeAcceso(codigo: string, nombre: string | null): string {
  return nombre === null ? codigo : `${codigo} · ${nombre}`;
}
