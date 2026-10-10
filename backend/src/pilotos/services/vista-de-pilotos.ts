import type { BusResumen } from '../../shared/contratos/flota';
import type { LineaResumen } from '../../shared/contratos/red';
import type { Piloto } from '../entities/piloto.entity';
import type { FlotaAdapter } from '../infrastructure/adapters/flota.adapter';
import type { RedAdapter } from '../infrastructure/adapters/red.adapter';
import type {
  PilotoEnListado,
  PilotoEnListadoCompleto,
  PilotoReducido,
} from '../queries/impl/listar-pilotos.query';
import type {
  DetalleCompletoDePiloto,
  DetalleDePiloto,
} from '../queries/impl/obtener-piloto.query';

interface Referencias {
  buses: Map<number, BusResumen>;
  lineas: Map<number, LineaResumen>;
}

/** Una llamada a flota por los buses de los pilotos y una a la red por las líneas de esos buses. */
async function cargarReferencias(
  filas: readonly Piloto[],
  flota: FlotaAdapter,
  red: RedAdapter,
): Promise<Referencias> {
  const busIds = [...new Set(filas.flatMap(({ busId }) => (busId === null ? [] : [busId])))];
  const buses = busIds.length > 0 ? await flota.obtenerBuses(busIds) : [];
  const lineaIds = [
    ...new Set(buses.flatMap(({ lineaId }) => (lineaId === null ? [] : [lineaId]))),
  ];
  const lineas = lineaIds.length > 0 ? await red.obtenerLineas(lineaIds) : [];
  return {
    buses: new Map(buses.map((bus) => [bus.id, bus])),
    lineas: new Map(lineas.map((linea) => [linea.id, linea])),
  };
}

/** Solo los campos de la ficha reducida, uno por uno: nada personal puede colarse. */
function aReducido(fila: Piloto, { buses, lineas }: Referencias): PilotoReducido {
  const bus = fila.busId === null ? undefined : buses.get(fila.busId);
  const linea = bus?.lineaId == null ? undefined : lineas.get(bus.lineaId);
  return {
    id: fila.id,
    nombre: fila.nombre,
    telefono: fila.telefono,
    bus: bus ? { id: bus.id, placa: bus.placa, estado: bus.estado } : null,
    linea: linea ? { id: linea.id, codigo: linea.codigo, nombre: linea.nombre } : null,
    busDeBaja: bus?.estado === 'BAJA',
  };
}

function aListadoCompleto(fila: Piloto, referencias: Referencias): PilotoEnListadoCompleto {
  return { ...aReducido(fila, referencias), dpi: fila.dpi };
}

function aDetalleCompleto(fila: Piloto, referencias: Referencias): DetalleCompletoDePiloto {
  return {
    ...aListadoCompleto(fila, referencias),
    direccionResidencia: fila.direccionResidencia,
    correo: fila.email,
    historialEducativo: fila.historialEducativo,
  };
}

export async function armarListado(
  filas: readonly Piloto[],
  completo: boolean,
  flota: FlotaAdapter,
  red: RedAdapter,
): Promise<PilotoEnListado[]> {
  const referencias = await cargarReferencias(filas, flota, red);
  return filas.map((fila) =>
    completo ? aListadoCompleto(fila, referencias) : aReducido(fila, referencias),
  );
}

export async function armarDetalle(
  fila: Piloto,
  completo: boolean,
  flota: FlotaAdapter,
  red: RedAdapter,
): Promise<DetalleDePiloto> {
  const referencias = await cargarReferencias([fila], flota, red);
  return completo ? aDetalleCompleto(fila, referencias) : aReducido(fila, referencias);
}
