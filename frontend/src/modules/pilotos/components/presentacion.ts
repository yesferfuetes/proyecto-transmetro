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

type BusAsignable = Readonly<{
  id: number;
  placa: string;
  linea: Readonly<{ codigo: string }> | null;
  pilotos: number;
}>;

/** Bus para un selector: su placa, su línea y cuántos pilotos tiene ya. */
export function opcionDeBus(bus: BusAsignable): OpcionDeLista {
  const linea = bus.linea === null ? 'sin línea' : `línea ${bus.linea.codigo}`;
  const pilotos = bus.pilotos === 1 ? '1 piloto' : `${bus.pilotos} pilotos`;
  return { valor: String(bus.id), etiqueta: `${bus.placa} · ${linea} (${pilotos})` };
}

/**
 * Opciones de bus para cambiar el de un piloto. Si su bus actual ya no se ofrece (de baja), se
 * agrega para que el selector no lo muestre como "sin bus".
 */
export function opcionesParaCambiar(
  buses: readonly BusAsignable[],
  actual: Readonly<{ id: number; placa: string }> | null,
): OpcionDeLista[] {
  const opciones = buses.map(opcionDeBus);
  if (actual !== null && !buses.some((bus) => bus.id === actual.id)) {
    opciones.unshift({ valor: String(actual.id), etiqueta: `${actual.placa} · de baja` });
  }
  return opciones;
}
