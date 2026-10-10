import type { RedCompleta } from '../../shared/contratos/red';
import type { FiltrosConNombres, FiltrosDeReporte } from './tipos-de-reporte';

/** Los filtros de una constancia con los nombres actuales de lo que filtran. */
export function describirFiltros(filtros: FiltrosDeReporte, red: RedCompleta): FiltrosConNombres {
  const descripcion: FiltrosConNombres = {};
  const linea = red.lineas.find((l) => l.id === filtros.lineaId);
  if (linea) {
    descripcion.linea = { id: linea.id, codigo: linea.codigo, nombre: linea.nombre };
  }
  const estacion = red.estaciones.find((e) => e.id === filtros.estacionId);
  if (estacion) {
    descripcion.estacion = { id: estacion.id, codigo: estacion.codigo, nombre: estacion.nombre };
  }
  const municipalidad = red.municipalidades.find((m) => m.id === filtros.municipalidadId);
  if (municipalidad) {
    descripcion.municipalidad = { id: municipalidad.id, nombre: municipalidad.nombre };
  }
  return descripcion;
}
