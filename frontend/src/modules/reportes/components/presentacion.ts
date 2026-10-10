import type { Opcion } from '@/shared/components/formulario';
import type { Estado } from '@/shared/types/diseno';
import type { OpcionesDeReporte } from '../schemas/opciones';
import type { EstadoDeBus, FilaDeBus } from '../schemas/reportes';

type ValorDeFiltro = string | number | undefined;

/** Enlace a una vista con sus filtros; omite los vacíos para que la URL quede limpia. */
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

export type OpcionesDelFormulario = Readonly<{
  lineas: readonly Opcion[];
  estaciones: readonly Opcion[];
  municipalidades: readonly Opcion[];
}>;

/** Solo lo que los selectores del formulario muestran: al navegador no llega nada más. */
export function opcionesDelFormulario(opciones: OpcionesDeReporte): OpcionesDelFormulario {
  return {
    lineas: opciones.lineas.map((l) => ({
      valor: String(l.id),
      etiqueta: `${l.codigo} · ${l.nombre}`,
    })),
    estaciones: opciones.estaciones.map((e) => ({
      valor: String(e.id),
      etiqueta: `${e.codigo} · ${e.nombre}`,
    })),
    municipalidades: opciones.municipalidades.map((m) => ({
      valor: String(m.id),
      etiqueta: m.nombre,
    })),
  };
}

export const ETIQUETA_DE_ESTADO_DE_BUS: Readonly<Record<EstadoDeBus, string>> = {
  ACTIVO: 'Activo',
  MANTENIMIENTO: 'En mantenimiento',
  BAJA: 'De baja',
};

export const ESTADO_VISUAL_DE_BUS: Readonly<Record<EstadoDeBus, Estado>> = {
  ACTIVO: 'exito',
  MANTENIMIENTO: 'advertencia',
  BAJA: 'neutro',
};

const ETIQUETA_DE_ESTADO_DE_LINEA: Readonly<Record<string, string>> = {
  ACTIVA: 'Activa',
  INACTIVA: 'Inactiva',
  EN_CONSTRUCCION: 'En construcción',
};

/** Estado de una línea para leerlo; un estado que no se conoce se muestra en minúsculas legibles. */
export function etiquetaDeEstadoDeLinea(estado: string): string {
  const conocida = ETIQUETA_DE_ESTADO_DE_LINEA[estado];
  if (conocida !== undefined) {
    return conocida;
  }
  const texto = estado.replaceAll('_', ' ').toLowerCase();
  return `${texto.charAt(0).toUpperCase()}${texto.slice(1)}`;
}

export type FilaDeTablaDeBuses =
  | Readonly<{ tipo: 'grupo'; clave: string; linea: FilaDeBus['linea'] }>
  | Readonly<{ tipo: 'bus'; clave: string; bus: FilaDeBus }>;

/** Una fila de encabezado cada vez que cambia la línea, incluida la primera fila de la página. */
export function filasAgrupadasPorLinea(buses: readonly FilaDeBus[]): FilaDeTablaDeBuses[] {
  const filas: FilaDeTablaDeBuses[] = [];
  let anterior: number | null | undefined;
  for (const bus of buses) {
    const actual = bus.linea?.id ?? null;
    if (actual !== anterior) {
      filas.push({ tipo: 'grupo', clave: `grupo-${actual ?? 'sin-linea'}`, linea: bus.linea });
      anterior = actual;
    }
    filas.push({ tipo: 'bus', clave: `bus-${bus.id}`, bus });
  }
  return filas;
}
