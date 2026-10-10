import { z } from 'zod';
import {
  esquemaId,
  esquemaIdOpcional,
  esquemaNumeroDePagina,
  esquemaReferenciaConNombre,
} from './comunes';

export const TIPOS_DE_REPORTE = ['ESTACIONES', 'LINEAS', 'BUSES'] as const;

export const esquemaTipoDeReporte = z.enum(TIPOS_DE_REPORTE, {
  error: 'Elige un tipo de reporte.',
});
export type TipoDeReporte = z.infer<typeof esquemaTipoDeReporte>;

export const ETIQUETA_DE_TIPO: Readonly<Record<TipoDeReporte, string>> = {
  ESTACIONES: 'Estaciones',
  LINEAS: 'Líneas',
  BUSES: 'Buses por línea',
};

const SEGMENTO_DE_TIPO: Readonly<Record<TipoDeReporte, string>> = {
  ESTACIONES: 'estaciones',
  LINEAS: 'lineas',
  BUSES: 'buses',
};

/** Ruta donde se lee el reporte de una constancia. */
export function rutaDelReporte(tipo: TipoDeReporte, consultaId: number): string {
  return `/reportes/${SEGMENTO_DE_TIPO[tipo]}?consulta=${consultaId}`;
}

/** Filtro de la constancia con su nombre; la línea puede traer también su código. */
const esquemaFiltroNombrado = esquemaReferenciaConNombre
  .extend({ codigo: z.string().optional() })
  .nullish()
  .transform((valor) => valor ?? undefined);

const esquemaFiltrosDeLaConsulta = z.object({
  linea: esquemaFiltroNombrado,
  estacion: esquemaFiltroNombrado,
  municipalidad: esquemaFiltroNombrado,
});
export type FiltrosAplicados = Partial<z.output<typeof esquemaFiltrosDeLaConsulta>>;

export const esquemaFiltrosAplicados = esquemaFiltrosDeLaConsulta
  .nullish()
  .transform((valor): FiltrosAplicados => valor ?? {});

export const esquemaConsulta = z.object({
  id: z.number().int().positive(),
  tipo: esquemaTipoDeReporte,
  filtros: esquemaFiltrosAplicados,
  fechaHora: z.string(),
});
export type Consulta = z.infer<typeof esquemaConsulta>;

function vacioComoFaltante(valor: unknown): unknown {
  return valor === '' || valor === null ? undefined : valor;
}

/** Un identificador de filtro escrito en un campo: vacío significa que no se filtra. */
const esquemaFiltroDeId = z.preprocess(vacioComoFaltante, esquemaId.optional());

/** Lo que se pide al generar o exportar: el tipo y, si se quiere, línea, estación y municipalidad. */
export const esquemaSolicitudDeReporte = z.object({
  tipo: z.preprocess(vacioComoFaltante, esquemaTipoDeReporte),
  lineaId: esquemaFiltroDeId,
  estacionId: esquemaFiltroDeId,
  municipalidadId: esquemaFiltroDeId,
});
export type SolicitudDeReporte = z.output<typeof esquemaSolicitudDeReporte>;

/** La misma solicitud que dio origen a una consulta, para repetirla al exportar. */
export function solicitudDeConsulta(consulta: Consulta): SolicitudDeReporte {
  return {
    tipo: consulta.tipo,
    lineaId: consulta.filtros.linea?.id,
    estacionId: consulta.filtros.estacion?.id,
    municipalidadId: consulta.filtros.municipalidad?.id,
  };
}

/** Parámetros de la URL de un reporte: la constancia y la página; lo que no sirve se ignora. */
export const esquemaParametrosDeReporte = z.object({
  consulta: esquemaIdOpcional,
  pagina: esquemaNumeroDePagina,
});
export type ParametrosDeReporte = z.infer<typeof esquemaParametrosDeReporte>;
