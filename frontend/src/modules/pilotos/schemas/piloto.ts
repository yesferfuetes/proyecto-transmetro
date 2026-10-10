import { z } from 'zod';
import {
  elegido,
  esquemaIdOpcional,
  esquemaNumeroDePagina,
  esquemaPagina,
  esquemaReferencia,
} from './comunes';

const esquemaBusDePiloto = z.object({
  id: z.number().int().positive(),
  placa: z.string(),
  estado: z.enum(['ACTIVO', 'MANTENIMIENTO', 'BAJA']),
});

/**
 * Ficha reducida, la única que ve el operador. Es estricta: si el backend mandara algún dato
 * personal, la respuesta se rechaza en lugar de llegar al navegador.
 */
export const esquemaPilotoReducido = z.strictObject({
  id: z.number().int().positive(),
  nombre: z.string(),
  telefono: z.string(),
  bus: esquemaBusDePiloto.nullable(),
  linea: esquemaReferencia.nullable(),
  busDeBaja: z.boolean(),
});
export type PilotoReducido = z.infer<typeof esquemaPilotoReducido>;

/** Fila del listado para supervisor y administrador: lo reducido más el DPI. */
export const esquemaPilotoDeLista = z.strictObject({
  ...esquemaPilotoReducido.shape,
  dpi: z.string(),
});
export type PilotoDeLista = z.infer<typeof esquemaPilotoDeLista>;

export const esquemaPilotoCompleto = z.strictObject({
  ...esquemaPilotoDeLista.shape,
  direccionResidencia: z.string(),
  correo: z.string().nullable(),
  historialEducativo: z.string(),
});
export type PilotoCompleto = z.infer<typeof esquemaPilotoCompleto>;

export const esquemaPaginaReducida = esquemaPagina(esquemaPilotoReducido);
export const esquemaPaginaCompleta = esquemaPagina(esquemaPilotoDeLista);

export type VistaDePilotos = 'reducida' | 'completa';

/** Página del listado con la vista que el rol de la sesión permite. */
export type ListadoDePilotos =
  | Readonly<{ vista: 'reducida'; pagina: z.infer<typeof esquemaPaginaReducida> }>
  | Readonly<{ vista: 'completa'; pagina: z.infer<typeof esquemaPaginaCompleta> }>;

/** Ficha de un piloto con la vista que el rol de la sesión permite. */
export type FichaDePiloto =
  | Readonly<{ vista: 'reducida'; piloto: PilotoReducido }>
  | Readonly<{ vista: 'completa'; piloto: PilotoCompleto }>;

export const esquemaOpciones = z.object({
  buses: z.array(
    z.object({
      id: z.number().int().positive(),
      placa: z.string(),
      linea: esquemaReferencia.nullable(),
      pilotos: z.number().int().nonnegative(),
    }),
  ),
  lineas: z.array(esquemaReferencia),
});
export type Opciones = z.infer<typeof esquemaOpciones>;

/** Filtros del listado tal como llegan en la URL; lo que no sirve se ignora. */
export const esquemaFiltrosPilotos = z.object({
  lineaId: esquemaIdOpcional,
  busId: esquemaIdOpcional,
  sinBus: z.literal('1').optional().catch(undefined),
  busqueda: z
    .string()
    .trim()
    .max(150)
    .transform((texto) => (texto === '' ? undefined : texto))
    .optional()
    .catch(undefined),
  pagina: esquemaNumeroDePagina,
});
export type FiltrosPilotos = z.infer<typeof esquemaFiltrosPilotos>;

/** Bus elegido en una lista: el valor vacío significa "sin bus". */
const esquemaBusOpcional = z.preprocess(
  (valor) => (valor === '' || valor === null || valor === undefined ? null : Number(valor)),
  z.number({ error: 'Elige un bus.' }).int('Elige un bus.').positive('Elige un bus.').nullable(),
);

const esquemaDpi = z
  .string({ error: 'Escribe el DPI.' })
  .trim()
  .min(1, 'Escribe el DPI.')
  .refine((texto) => /^\d{13}$/.test(texto.replace(/\s/g, '')), 'El DPI tiene 13 dígitos.');

const esquemaTelefono = z
  .string({ error: 'Escribe el teléfono.' })
  .trim()
  .min(1, 'Escribe el teléfono.')
  .refine((texto) => /^\d{4}-?\d{4}$/.test(texto), 'El teléfono tiene 8 dígitos.');

/** Texto obligatorio con su tope; los espacios a los lados no cuentan. */
function textoObligatorio(faltante: string, maximo: number): z.ZodString {
  return z
    .string({ error: faltante })
    .trim()
    .min(1, faltante)
    .max(maximo, `Usa como máximo ${maximo} caracteres.`);
}

const esquemaCorreo = z.preprocess(
  (valor) => (typeof valor === 'string' && valor.trim() === '' ? undefined : valor),
  z
    .email('Escribe un correo con forma de correo.')
    .trim()
    .max(150, 'Usa como máximo 150 caracteres.')
    .optional(),
);

export const esquemaEdicionDePiloto = z.object({
  nombre: textoObligatorio('Escribe el nombre.', 150),
  dpi: esquemaDpi,
  direccionResidencia: textoObligatorio('Escribe la dirección de residencia.', 250),
  telefono: esquemaTelefono,
  correo: esquemaCorreo,
  historialEducativo: textoObligatorio('Escribe el historial educativo.', 2000),
});
export type EdicionDePiloto = z.output<typeof esquemaEdicionDePiloto>;

/** Al registrar, el bus es opcional: vacío o ausente es "sin bus". */
export const esquemaFormularioPiloto = esquemaEdicionDePiloto.extend({
  busId: z.preprocess(
    (valor) => (valor === '' || valor === null || valor === undefined ? undefined : valor),
    elegido('Elige un bus.').optional(),
  ),
});
export type FormularioPiloto = z.output<typeof esquemaFormularioPiloto>;

export const esquemaCambioDeBus = z.object({ busId: esquemaBusOpcional });
export type CambioDeBus = z.output<typeof esquemaCambioDeBus>;
