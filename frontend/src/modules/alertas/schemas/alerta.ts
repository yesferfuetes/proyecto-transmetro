import { z } from 'zod';
import {
  esquemaIdOpcional,
  esquemaNumeroDePagina,
  esquemaPagina,
  esquemaReferencia,
} from './comunes';

export const esquemaTipoDeAlerta = z.enum(['SOBRECUPO', 'BAJA_OCUPACION']);
export type TipoDeAlerta = z.infer<typeof esquemaTipoDeAlerta>;

export const ETIQUETA_DE_TIPO: Readonly<Record<TipoDeAlerta, string>> = {
  SOBRECUPO: 'Sobrecupo',
  BAJA_OCUPACION: 'Baja ocupación',
};

export const esquemaEstadoDeAlerta = z.enum(['pendiente', 'atendida']);
export type EstadoDeAlerta = z.infer<typeof esquemaEstadoDeAlerta>;

export const ETIQUETA_DE_ESTADO: Readonly<Record<EstadoDeAlerta, string>> = {
  pendiente: 'Pendiente',
  atendida: 'Atendida',
};

export const esquemaAlerta = z.object({
  id: z.number().int().positive(),
  tipo: esquemaTipoDeAlerta,
  aviso: z.string(),
  porcentaje: z.coerce.number(),
  fechaHora: z.string(),
  atendida: z.boolean(),
  estacion: esquemaReferencia,
  bus: z.object({ id: z.number().int().positive(), placa: z.string() }),
  linea: esquemaReferencia.nullable(),
  atendidaPor: z.object({ id: z.number().int().positive(), nombre: z.string() }).nullable(),
});
export type Alerta = z.infer<typeof esquemaAlerta>;

export const esquemaPaginaAlertas = esquemaPagina(esquemaAlerta);
export type PaginaAlertas = z.infer<typeof esquemaPaginaAlertas>;

/** Filtros del listado tal como llegan en la URL; lo que no sirve se ignora. */
export const esquemaFiltrosAlertas = z.object({
  estado: esquemaEstadoDeAlerta.optional().catch(undefined),
  tipo: esquemaTipoDeAlerta.optional().catch(undefined),
  estacion: esquemaIdOpcional,
  linea: esquemaIdOpcional,
  pagina: esquemaNumeroDePagina,
  resaltada: esquemaIdOpcional,
});
export type FiltrosAlertas = z.infer<typeof esquemaFiltrosAlertas>;

/** `ultimaId` es 0 cuando todavía no hay ninguna alerta. */
export const esquemaHuella = z.object({
  pendientes: z.number().int().nonnegative(),
  atendidas: z.number().int().nonnegative(),
  ultimaId: z.number().int().nonnegative(),
});
export type Huella = z.infer<typeof esquemaHuella>;

export const esquemaOpcionesDeAlertas = z.object({
  estaciones: z.array(esquemaReferencia),
  lineas: z.array(esquemaReferencia),
});
export type OpcionesDeAlertas = z.infer<typeof esquemaOpcionesDeAlertas>;
