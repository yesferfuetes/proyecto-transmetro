import { z } from 'zod';
import { esquemaNumeroDePagina, esquemaPagina, textoOpcional } from './comunes';

export const esquemaMunicipalidadListado = z.object({
  id: z.number().int().positive(),
  nombre: z.string(),
  departamento: z.string().nullable(),
  fechaIncorporacion: z.string().nullable(),
  numeroDeLineas: z.number().int().nonnegative(),
  numeroDeEstaciones: z.number().int().nonnegative(),
  sinRed: z.boolean(),
});

export type MunicipalidadListado = z.infer<typeof esquemaMunicipalidadListado>;

export const esquemaPaginaMunicipalidades = esquemaPagina(esquemaMunicipalidadListado);

export type PaginaMunicipalidades = z.infer<typeof esquemaPaginaMunicipalidades>;

export const esquemaMunicipalidad = z.object({
  id: z.number().int().positive(),
  nombre: z.string(),
  departamento: z.string().nullable(),
  fechaIncorporacion: z.string().nullable(),
});

export type Municipalidad = z.infer<typeof esquemaMunicipalidad>;

export const esquemaFiltrosMunicipalidades = z.object({ pagina: esquemaNumeroDePagina });

export const esquemaFormularioMunicipalidad = z.object({
  nombre: z
    .string({ error: 'Escribe el nombre.' })
    .trim()
    .min(1, 'Escribe el nombre.')
    .max(150, 'Usa como máximo 150 caracteres.'),
  departamento: textoOpcional(100, 'Usa como máximo 100 caracteres.'),
  fechaIncorporacion: z.preprocess(
    (valor) => (valor === '' ? undefined : valor),
    z.iso.date('Escribe una fecha válida.').optional(),
  ),
});

export type FormularioMunicipalidad = z.output<typeof esquemaFormularioMunicipalidad>;
