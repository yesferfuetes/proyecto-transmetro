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

type OpcionDeLista = Readonly<{ valor: string; etiqueta: string }>;

type LineaConCupo = Readonly<{
  id: number;
  codigo: string;
  nombre: string;
  buses: number;
  maximo: number;
}>;

type ParqueoConCupo = Readonly<{
  id: number;
  codigo: string;
  capacidadVehiculos: number;
  buses: number;
  estacion: Readonly<{ nombre: string }>;
}>;

/** Línea para un selector: su código, su nombre y cuántos buses lleva sobre su máximo. */
export function opcionDeLinea(linea: LineaConCupo): OpcionDeLista {
  return {
    valor: String(linea.id),
    etiqueta: `${linea.codigo} · ${linea.nombre} (${linea.buses} de ${linea.maximo} buses)`,
  };
}

/** Parqueo para un selector: su estación, su código y cuántos buses guarda sobre su capacidad. */
export function opcionDeParqueo(parqueo: ParqueoConCupo): OpcionDeLista {
  return {
    valor: String(parqueo.id),
    etiqueta: `${parqueo.estacion.nombre} · ${parqueo.codigo} (${parqueo.buses} de ${parqueo.capacidadVehiculos})`,
  };
}
