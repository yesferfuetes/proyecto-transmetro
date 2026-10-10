import type { EstadoDeLinea } from '../../shared/contratos/red';
import type { EstadoDeBus, EstadoDeFlota } from '../../shared/contratos/flota';

export const TIPOS_DE_REPORTE = ['ESTACIONES', 'LINEAS', 'BUSES'] as const;

export type TipoDeReporte = (typeof TIPOS_DE_REPORTE)[number];

export function esTipoDeReporte(valor: unknown): valor is TipoDeReporte {
  return (TIPOS_DE_REPORTE as readonly unknown[]).includes(valor);
}

export interface FiltrosDeReporte {
  lineaId?: number;
  estacionId?: number;
  municipalidadId?: number;
}

export interface LineaBasica {
  id: number;
  codigo: string;
  nombre: string;
}

export interface FiltrosConNombres {
  linea?: LineaBasica;
  estacion?: { id: number; codigo: string; nombre: string };
  municipalidad?: { id: number; nombre: string };
}

export interface FilaDeEstacion {
  id: number;
  codigo: string;
  nombre: string;
  municipalidad: { id: number; nombre: string };
  lineas: LineaBasica[];
  tieneParqueo: boolean;
}

export interface FilaDeLinea {
  id: number;
  codigo: string;
  nombre: string;
  municipalidad: { id: number; nombre: string };
  estado: EstadoDeLinea;
  estaciones: number;
  longitudKm: number | null;
  buses: number;
  minimo: number;
  maximo: number;
  estadoDeFlota: EstadoDeFlota;
}

export interface FilaDeBus {
  id: number;
  placa: string;
  capacidadMax: number;
  estado: EstadoDeBus;
  linea: LineaBasica | null;
  parqueo: { id: number; codigo: string; estacion: { id: number; nombre: string } };
}

export interface GrupoDeBuses {
  linea: LineaBasica | null;
  buses: number;
}

/** Lo que un reporte dice de su propia constancia: cuándo y con qué filtros se generó. */
export interface ConsultaDeReporte {
  id: number;
  tipo: TipoDeReporte;
  filtros: FiltrosConNombres;
  fechaHora: Date;
}
