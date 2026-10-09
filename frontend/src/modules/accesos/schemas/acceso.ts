import { z } from 'zod';
import {
  esquemaBusqueda,
  esquemaIdOpcional,
  esquemaNumeroDePagina,
  esquemaPagina,
  esquemaTextoONulo,
  textoOpcional,
} from './comunes';
import { esquemaEstacionElegida, esquemaGuardiaElegido, esquemaTurno } from './turno';

const esquemaIdPositivo = z.number().int().positive();

export const esquemaReferenciaDeEstacion = z.object({
  id: esquemaIdPositivo,
  codigo: z.string(),
  nombre: z.string(),
});

export type ReferenciaDeEstacion = z.infer<typeof esquemaReferenciaDeEstacion>;

/** Acceso tal como se resume en un listado: cuántos guardias lo cubren. */
export const esquemaAccesoResumen = z.object({
  id: esquemaIdPositivo,
  codigo: z.string(),
  nombre: esquemaTextoONulo,
  guardias: z.number().int().nonnegative(),
});

export type AccesoResumen = z.infer<typeof esquemaAccesoResumen>;

export const esquemaEstacionConAccesos = z.object({
  estacion: esquemaReferenciaDeEstacion,
  accesos: z.array(esquemaAccesoResumen),
});

export type EstacionConAccesos = z.infer<typeof esquemaEstacionConAccesos>;

export const esquemaPaginaAccesos = esquemaPagina(esquemaEstacionConAccesos);

export type PaginaAccesos = z.infer<typeof esquemaPaginaAccesos>;

export const esquemaAsignacion = z.object({
  guardia: z.object({ id: esquemaIdPositivo, nombre: z.string(), dpi: z.string() }),
  turno: z.string(),
});

export type Asignacion = z.infer<typeof esquemaAsignacion>;

export const esquemaAccesoDetalle = z.object({
  id: esquemaIdPositivo,
  codigo: z.string(),
  nombre: esquemaTextoONulo,
  estacion: esquemaReferenciaDeEstacion,
  asignaciones: z.array(esquemaAsignacion),
});

export type AccesoDetalle = z.infer<typeof esquemaAccesoDetalle>;

export const esquemaAccesosDeLinea = z.object({
  linea: z.object({ id: esquemaIdPositivo, codigo: z.string(), nombre: z.string() }),
  estaciones: z.array(
    z.object({
      posicion: esquemaIdPositivo,
      id: esquemaIdPositivo,
      codigo: z.string(),
      nombre: z.string(),
      accesos: z.array(esquemaAccesoResumen),
      sinAccesos: z.boolean(),
    }),
  ),
});

export type AccesosDeLinea = z.infer<typeof esquemaAccesosDeLinea>;

export const esquemaOpcionesDeEstacion = z.array(esquemaReferenciaDeEstacion);

/** Filtros del listado tal como llegan en la URL; lo que no sirve se ignora. */
export const esquemaFiltrosAccesos = z.object({
  lineaId: esquemaIdOpcional,
  estacionId: esquemaIdOpcional,
  busqueda: esquemaBusqueda,
  pagina: esquemaNumeroDePagina,
});

export type FiltrosAccesos = z.infer<typeof esquemaFiltrosAccesos>;

const esquemaCodigoDeAcceso = z
  .string({ error: 'Escribe el código.' })
  .trim()
  .min(1, 'Escribe el código.')
  .max(10, 'Usa como máximo 10 caracteres.');

const NOMBRE_LARGO = 'Usa como máximo 100 caracteres.';

/** El acceso se registra con su primer guardia y su turno. */
export const esquemaFormularioAcceso = z.object({
  estacionId: esquemaEstacionElegida,
  codigo: esquemaCodigoDeAcceso,
  nombre: textoOpcional(100, NOMBRE_LARGO),
  guardiaId: esquemaGuardiaElegido,
  turno: esquemaTurno,
});

export type FormularioAcceso = z.output<typeof esquemaFormularioAcceso>;

/** Al editar solo cambia el nombre: el código y la estación no se tocan. */
export const esquemaFormularioEdicionAcceso = z.object({
  nombre: z
    .string({ error: 'Escribe el nombre.' })
    .trim()
    .min(1, 'Escribe el nombre.')
    .max(100, NOMBRE_LARGO),
});

export type FormularioEdicionAcceso = z.output<typeof esquemaFormularioEdicionAcceso>;

/** Guardia y turno de una asignación, para asignar y para quitar. */
export const esquemaFormularioAsignacion = z.object({
  guardiaId: esquemaGuardiaElegido,
  turno: esquemaTurno,
});

export type FormularioAsignacion = z.output<typeof esquemaFormularioAsignacion>;
